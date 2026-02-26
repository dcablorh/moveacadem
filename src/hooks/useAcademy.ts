import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
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
} from "@/config/sui";

// Fetch all courses via events
export function useCourses() {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const result = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::CourseCreated` },
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
              return { id: parsed.course_id, ...(obj.data.content.fields as any) };
            }
          } catch {
            return null;
          }
          return null;
        })
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
        return { id: courseId, ...(obj.data.content.fields as any) };
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
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::LessonCreated` },
        limit: 100,
      });
      
      const lessonEvents = result.data.filter(
        (e) => (e.parsedJson as any).course_id === courseId
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
              return { id: parsed.lesson_id, ...(obj.data.content.fields as any) };
            }
          } catch {
            return null;
          }
          return null;
        })
      );
      return lessons.filter(Boolean).sort((a: any, b: any) => Number(a.order) - Number(b.order));
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
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ExerciseCreated` },
        limit: 100,
      });
      
      const exEvents = result.data.filter(
        (e) => (e.parsedJson as any).lesson_id === lessonId
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
              return { id: parsed.exercise_id, ...(obj.data.content.fields as any) };
            }
          } catch {
            return null;
          }
          return null;
        })
      );
      return exercises.filter(Boolean);
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
      return objects.data.map((o) => {
        if (o.data?.content?.dataType === "moveObject") {
          return { id: o.data.objectId, ...(o.data.content.fields as any) };
        }
        return null;
      }).filter(Boolean);
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
      return objects.data.map((o) => {
        if (o.data?.content?.dataType === "moveObject") {
          return { id: o.data.objectId, ...(o.data.content.fields as any) };
        }
        return null;
      }).filter(Boolean);
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
      return objects.data.map((o) => {
        if (o.data?.content?.dataType === "moveObject") {
          return { id: o.data.objectId, ...(o.data.content.fields as any) };
        }
        return null;
      }).filter(Boolean);
    },
  });
}

// Transaction hooks
export function useCreateCourse() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (title: string, description: string) => {
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
    return result;
  };
}

export function usePublishCourse() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (courseId: string, capId: string) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::publish_course`,
      arguments: [tx.object(courseId), tx.object(capId)],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    return result;
  };
}

export function useCreateLesson() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (
    courseId: string,
    capId: string,
    title: string,
    contentUri: string,
    quizUri: string,
    order: number
  ) => {
    const tx = new Transaction();
    const contentBytes = Array.from(new TextEncoder().encode(contentUri));
    const quizBytes = Array.from(new TextEncoder().encode(quizUri));
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_lesson`,
      arguments: [
        tx.object(LESSON_REGISTRY_ID),
        tx.object(courseId),
        tx.object(capId),
        tx.pure(bcs.string().serialize(title)),
        tx.pure(bcs.vector(bcs.u8()).serialize(contentBytes)),
        tx.pure(bcs.vector(bcs.u8()).serialize(quizBytes)),
        tx.pure(bcs.u64().serialize(order)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
    queryClient.invalidateQueries({ queryKey: ["course", courseId] });
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
    masteryThreshold: number
  ) => {
    const tx = new Transaction();
    const uriBytes = Array.from(new TextEncoder().encode(exerciseUri));
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_exercise`,
      arguments: [
        tx.object(EXERCISE_REGISTRY_ID),
        tx.object(lessonId),
        tx.object(capId),
        tx.pure(bcs.string().serialize(title)),
        tx.pure(bcs.vector(bcs.u8()).serialize(uriBytes)),
        tx.pure(bcs.u64().serialize(maxScore)),
        tx.pure(bcs.u64().serialize(masteryThreshold)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
    return result;
  };
}

export function useCompleteLesson() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (courseId: string, lessonId: string, score: number) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::complete_lesson`,
      arguments: [
        tx.object(PROGRESS_REGISTRY_ID),
        tx.object(courseId),
        tx.object(lessonId),
        tx.pure(bcs.u64().serialize(score)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["progress"] });
    return result;
  };
}

export function useSubmitExercise() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (
    courseId: string,
    lessonId: string,
    exerciseId: string,
    score: number,
    hintsUsed: number
  ) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::submit_exercise`,
      arguments: [
        tx.object(PROGRESS_REGISTRY_ID),
        tx.object(EXERCISE_REGISTRY_ID),
        tx.object(courseId),
        tx.object(lessonId),
        tx.object(exerciseId),
        tx.pure(bcs.u64().serialize(score)),
        tx.pure(bcs.u64().serialize(hintsUsed)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["progress"] });
    queryClient.invalidateQueries({ queryKey: ["exercises"] });
    return result;
  };
}

export function useIssueCertificate() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return async (courseId: string, imageUrl: string) => {
    const tx = new Transaction();
    const urlBytes = Array.from(new TextEncoder().encode(imageUrl));
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::issue_certificate`,
      arguments: [
        tx.object(CERTIFICATE_REGISTRY_ID),
        tx.object(PROGRESS_REGISTRY_ID),
        tx.object(courseId),
        tx.pure(bcs.vector(bcs.u8()).serialize(urlBytes)),
      ],
    });
    const result = await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["certificates"] });
    return result;
  };
}
