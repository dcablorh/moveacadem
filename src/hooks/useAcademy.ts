import {
  useSuiClient,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bcs } from "@mysten/sui/bcs";
import {
  PACKAGE_ID,
  MODULE_NAME,
  COURSE_REGISTRY_ID,
  LESSON_REGISTRY_ID,
  PROGRESS_REGISTRY_ID,
  EXERCISE_REGISTRY_ID,
  CERTIFICATE_REGISTRY_ID,
  progressType,
  certificateType,
  courseOwnerCapType,
  adminCapType,
} from "@/config/sui";

/**
 * Safely extract fields from a Sui MoveObject, ensuring `id` is always a
 * plain hex-string rather than the Sui UID struct `{ id: "0x..." }`.
 *
 * Sui returns `content.fields.id` as `{ id: "0x..." }` for objects with
 * `key` ability. If we naively spread the fields AFTER setting our own `id`,
 * the UID struct overwrites it and every downstream `.id` lookup breaks
 * (e.g. `normalizeSuiAddress` can't call `.toLowerCase()` on an object).
 */
function extractFields(objectId: string, fields: Record<string, any>): any {
  // Spread fields first, then override id with the raw objectId string.
  const { id: _uid, ...rest } = fields;
  return { ...rest, id: objectId };
}

/**
 * Coerce a value to a Sui object-id string. Handles the case where the
 * value is a UID struct `{ id: "0x..." }` instead of a plain string.
 */
function toStringId(value: any): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.id === "string")
    return value.id;
  throw new Error(`Invalid object ID: ${JSON.stringify(value)}`);
}

// Fetch all courses via events
export function useCourses() {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const result = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::CourseCreated`,
        },
        limit: 50,
      });

      const courses = await Promise.all(
        result.data.map(async (event) => {
          const parsed = event.parsedJson as any;
          try {
            const obj = await client.getObject({
              id: parsed.course_id,
              options: { showContent: true },
            });
            if (obj.data?.content?.dataType === "moveObject") {
              return extractFields(
                parsed.course_id,
                obj.data.content.fields as any,
              );
            }
          } catch {
            return null;
          }
          return null;
        }),
      );
      return courses.filter(Boolean);
    },
  });
}

// Fetch single course
export function useCourse(courseId: string | undefined) {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["course", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const obj = await client.getObject({
        id: courseId!,
        options: { showContent: true },
      });
      if (obj.data?.content?.dataType === "moveObject") {
        return extractFields(courseId!, obj.data.content.fields as any);
      }
      return null;
    },
  });
}

// Fetch lessons for a course
export function useCourseLessons(courseId: string | undefined) {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["lessons", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const result = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::LessonCreated`,
        },
        limit: 100,
      });

      const lessonEvents = result.data.filter(
        (e) => (e.parsedJson as any).course_id === courseId,
      );

      const lessons = await Promise.all(
        lessonEvents.map(async (event) => {
          const parsed = event.parsedJson as any;
          try {
            const obj = await client.getObject({
              id: parsed.lesson_id,
              options: { showContent: true },
            });
            if (obj.data?.content?.dataType === "moveObject") {
              return extractFields(
                parsed.lesson_id,
                obj.data.content.fields as any,
              );
            }
          } catch {
            return null;
          }
          return null;
        }),
      );
      return lessons
        .filter(Boolean)
        .sort((a: any, b: any) => Number(a.order) - Number(b.order));
    },
  });
}

// Fetch exercises for a lesson
export function useLessonExercises(lessonId: string | undefined) {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["exercises", lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const result = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ExerciseCreated`,
        },
        limit: 100,
      });

      const exEvents = result.data.filter(
        (e) => (e.parsedJson as any).lesson_id === lessonId,
      );

      const exercises = await Promise.all(
        exEvents.map(async (event) => {
          const parsed = event.parsedJson as any;
          try {
            const obj = await client.getObject({
              id: parsed.exercise_id,
              options: { showContent: true },
            });
            if (obj.data?.content?.dataType === "moveObject") {
              return extractFields(
                parsed.exercise_id,
                obj.data.content.fields as any,
              );
            }
          } catch {
            return null;
          }
          return null;
        }),
      );
      return exercises.filter(Boolean);
    },
  });
}

// Fetch exercise counts for all lessons in a course (for readiness checklist)
export function useCourseExerciseCounts(courseId: string | undefined) {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["exerciseCounts", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const result = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ExerciseCreated`,
        },
        limit: 200,
      });

      const counts: Record<string, number> = {};
      let total = 0;
      result.data.forEach((e) => {
        const parsed = e.parsedJson as any;
        // We need to check if this exercise belongs to a lesson in this course
        // ExerciseCreated event should have lesson_id; we filter later
        const lid = parsed.lesson_id;
        counts[lid] = (counts[lid] || 0) + 1;
        total++;
      });
      return { perLesson: counts, total };
    },
  });
}

// Fetch student progress
export function useStudentProgress() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  return useQuery({
    queryKey: ["progress", account?.address],
    enabled: !!account,
    queryFn: async () => {
      const objects = await client.getOwnedObjects({
        owner: account!.address,
        filter: { StructType: progressType },
        options: { showContent: true },
      });
      return objects.data
        .map((o) => {
          if (o.data?.content?.dataType === "moveObject") {
            return extractFields(o.data.objectId, o.data.content.fields as any);
          }
          return null;
        })
        .filter(Boolean);
    },
  });
}

// Fetch student certificates
export function useStudentCertificates() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  return useQuery({
    queryKey: ["certificates", account?.address],
    enabled: !!account,
    queryFn: async () => {
      const objects = await client.getOwnedObjects({
        owner: account!.address,
        filter: { StructType: certificateType },
        options: { showContent: true },
      });
      return objects.data
        .map((o) => {
          if (o.data?.content?.dataType === "moveObject") {
            return extractFields(o.data.objectId, o.data.content.fields as any);
          }
          return null;
        })
        .filter(Boolean);
    },
  });
}

// Fetch owned CourseOwnerCaps
export function useOwnerCaps() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  return useQuery({
    queryKey: ["ownerCaps", account?.address],
    enabled: !!account,
    queryFn: async () => {
      const objects = await client.getOwnedObjects({
        owner: account!.address,
        filter: { StructType: courseOwnerCapType },
        options: { showContent: true },
      });
      return objects.data
        .map((o) => {
          if (o.data?.content?.dataType === "moveObject") {
            return extractFields(o.data.objectId, o.data.content.fields as any);
          }
          return null;
        })
        .filter(Boolean);
    },
  });
}

// Fetch owned admin capabilities (if the Move module defines AdminCap)
export function useAdminCaps() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  return useQuery({
    queryKey: ["adminCaps", account?.address],
    enabled: !!account,
    queryFn: async () => {
      const objects = await client.getOwnedObjects({
        owner: account!.address,
        filter: { StructType: adminCapType },
        options: { showContent: true },
      });
      return objects.data
        .map((o) => {
          if (o.data?.content?.dataType === "moveObject") {
            return extractFields(o.data.objectId, o.data.content.fields as any);
          }
          return null;
        })
        .filter(Boolean);
    },
  });
}

// Transaction hooks
export function useCreateCourse() {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (title: string, description: string): Promise<string | null> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_course`,
      arguments: [
        tx.object(COURSE_REGISTRY_ID),
        tx.pure(bcs.string().serialize(title)),
        tx.pure(bcs.string().serialize(description)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    queryClient.invalidateQueries({ queryKey: ["ownerCaps"] });

    // Extract created course ID from transaction effects
    try {
      const txDetails = await client.waitForTransaction({
        digest: result.digest,
        options: { showObjectChanges: true },
      });
      const created = txDetails.objectChanges?.find(
        (c: any) =>
          c.type === "created" &&
          c.objectType?.includes("::Course") &&
          !c.objectType?.includes("CourseOwnerCap"),
      );
      return (created as any)?.objectId || null;
    } catch {
      return null;
    }
  };
}

export function usePublishCourse() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (courseId: string, capId: string) => {
    const cid = toStringId(courseId);
    const cap = toStringId(capId);
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::publish_course`,
      arguments: [tx.object(cid), tx.object(cap)],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    queryClient.invalidateQueries({ queryKey: ["course", cid] });
    return result;
  };
}

export function useCreateLesson() {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (
    courseId: string,
    capId: string,
    title: string,
    contentUri: string,
    quizUri: string,
    order: number,
  ) => {
    const cid = toStringId(courseId);
    const cap = toStringId(capId);

    // ensure we actually received the required IDs
    if (!cid) throw new Error("createLesson called without courseId");
    if (!cap) throw new Error("createLesson called without capId");

    // runtime sanity checks to catch mismatched IDs early
    try {
      const courseObj = await client.getObject({
        id: cid,
        options: { showType: true },
      });
      const capObj = await client.getObject({
        id: cap,
        options: { showType: true },
      });
      const regObj = await client.getObject({
        id: LESSON_REGISTRY_ID,
        options: { showType: true },
      });
      console.debug("object types before create_lesson", {
        course: courseObj.data?.type,
        cap: capObj.data?.type,
        lessonRegistry: regObj.data?.type,
      });
      // simple assertions; throw informative error if mismatch
      if (!courseObj.data?.type?.includes("::Course")) {
        throw new Error(`Expected course object, got ${courseObj.data?.type}`);
      }
      if (!capObj.data?.type?.includes("::CourseOwnerCap")) {
        throw new Error(`Expected cap object, got ${capObj.data?.type}`);
      }
      if (!regObj.data?.type?.includes("::LessonRegistry")) {
        throw new Error(
          `Expected lesson registry object, got ${regObj.data?.type}`,
        );
      }
    } catch (e) {
      console.error("validation failed before create_lesson", e);
      throw e;
    }

    const tx = new Transaction();
    const contentBytes = Array.from(new TextEncoder().encode(contentUri));
    const quizBytes = Array.from(new TextEncoder().encode(quizUri));
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_lesson`,
      arguments: [
        tx.object(LESSON_REGISTRY_ID),
        tx.object(cid),
        tx.object(cap),
        tx.pure(bcs.string().serialize(title)),
        tx.pure(bcs.vector(bcs.u8()).serialize(contentBytes)),
        tx.pure(bcs.vector(bcs.u8()).serialize(quizBytes)),
        tx.pure(bcs.u64().serialize(order)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["lessons", cid] });
    queryClient.invalidateQueries({ queryKey: ["course", cid] });
    return result;
  };
}

export function useCreateExercise() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (
    lessonId: string,
    capId: string,
    title: string,
    exerciseUri: string,
    maxScore: number,
    masteryThreshold: number,
  ) => {
    const lid = toStringId(lessonId);
    const cap = toStringId(capId);
    const tx = new Transaction();
    const uriBytes = Array.from(new TextEncoder().encode(exerciseUri));
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_exercise`,
      arguments: [
        tx.object(EXERCISE_REGISTRY_ID),
        tx.object(lid),
        tx.object(cap),
        tx.pure(bcs.string().serialize(title)),
        tx.pure(bcs.vector(bcs.u8()).serialize(uriBytes)),
        tx.pure(bcs.u64().serialize(maxScore)),
        tx.pure(bcs.u64().serialize(masteryThreshold)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["exercises", lid] });
    queryClient.invalidateQueries({ queryKey: ["exerciseCounts"] });
    return result;
  };
}

export function useCompleteLesson() {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (courseId: string, lessonId: string, score: number) => {
    const cid = toStringId(courseId);
    const lid = toStringId(lessonId);
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::complete_lesson`,
      arguments: [
        tx.object(PROGRESS_REGISTRY_ID),
        tx.object(cid),
        tx.object(lid),
        tx.pure(bcs.u64().serialize(score)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    const txDetails = await client.waitForTransaction({
      digest: result.digest,
      options: { showEvents: true },
    });
    queryClient.invalidateQueries({ queryKey: ["progress"] });
    return txDetails;
  };
}

export function useSubmitExercise() {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (
    courseId: string,
    lessonId: string,
    exerciseId: string,
    score: number,
    hintsUsed: number,
  ) => {
    const cid = toStringId(courseId);
    const lid = toStringId(lessonId);
    const eid = toStringId(exerciseId);
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::submit_exercise`,
      arguments: [
        tx.object(PROGRESS_REGISTRY_ID),
        tx.object(EXERCISE_REGISTRY_ID),
        tx.object(cid),
        tx.object(lid),
        tx.object(eid),
        tx.pure(bcs.u64().serialize(score)),
        tx.pure(bcs.u64().serialize(hintsUsed)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    const txDetails = await client.waitForTransaction({
      digest: result.digest,
      options: { showEvents: true },
    });
    queryClient.invalidateQueries({ queryKey: ["progress"] });
    queryClient.invalidateQueries({ queryKey: ["exercises"] });
    return txDetails;
  };
}

export function useUpdateCourse() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (
    courseId: string,
    capId: string,
    title: string,
    description: string,
  ) => {
    const cid = toStringId(courseId);
    const cap = toStringId(capId);
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::update_course`,
      arguments: [
        tx.object(cid),
        tx.object(cap),
        tx.pure(bcs.string().serialize(title)),
        tx.pure(bcs.string().serialize(description)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    queryClient.invalidateQueries({ queryKey: ["course", cid] });
    return result;
  };
}

export function useUpdateLesson() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (
    lessonId: string,
    courseId: string,
    capId: string,
    title: string,
    contentUri: string,
    quizUri: string,
  ) => {
    const lid = toStringId(lessonId);
    const cid = toStringId(courseId);
    const cap = toStringId(capId);
    const tx = new Transaction();
    const contentBytes = Array.from(new TextEncoder().encode(contentUri));
    const quizBytes = Array.from(new TextEncoder().encode(quizUri));
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::update_lesson`,
      arguments: [
        tx.object(lid),
        tx.object(cid),
        tx.object(cap),
        tx.pure(bcs.string().serialize(title)),
        tx.pure(bcs.vector(bcs.u8()).serialize(contentBytes)),
        tx.pure(bcs.vector(bcs.u8()).serialize(quizBytes)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["lessons", cid] });
    return result;
  };
}

export function useIssueCertificate() {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (courseId: string, imageUrl: string) => {
    const cid = toStringId(courseId);
    const tx = new Transaction();
    const urlBytes = Array.from(new TextEncoder().encode(imageUrl));
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::issue_certificate`,
      arguments: [
        tx.object(CERTIFICATE_REGISTRY_ID),
        tx.object(PROGRESS_REGISTRY_ID),
        tx.object(cid),
        tx.pure(bcs.vector(bcs.u8()).serialize(urlBytes)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    const txDetails = await client.waitForTransaction({
      digest: result.digest,
      options: { showEvents: true },
    });
    queryClient.invalidateQueries({ queryKey: ["certificates"] });
    return txDetails;
  };
}
