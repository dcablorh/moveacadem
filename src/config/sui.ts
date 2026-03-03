export const PACKAGE_ID = "0x2ed3b98c8788f40ff501c7d6538bf1f588b88b339a5be86e374842a5cec840df";
export const MODULE_NAME = "academy";

// Shared object IDs
export const COURSE_REGISTRY_ID = "0x5352b10f6fe83f8f51a945804c2f7e555455f9b94cc7735d37142e588eb9f159";
export const CERTIFICATE_REGISTRY_ID = "0x69763bc5390d91613a4851fb0aa473302e32e7dd9f9cabce04425ffdd989e7c4";
export const LESSON_REGISTRY_ID = "0x938d77fc0f7c0be598891f76646028d8c2a9aeac625292649e5c150966704117";
export const PROGRESS_REGISTRY_ID = "0xced47ff7d66ab34d7996c5f48867e750a45f45d95c3f1340ee84e74bdc77b789";
export const EXERCISE_REGISTRY_ID = "0xfd6dcc2ee2a8ccfcd4f6746401beec5a80bbfc8c96b142380d8d1e88bfea4e64";

export const NETWORK = "testnet" as const;

// Type helpers
export const courseType = `${PACKAGE_ID}::${MODULE_NAME}::Course`;
export const lessonType = `${PACKAGE_ID}::${MODULE_NAME}::Lesson`;
export const exerciseType = `${PACKAGE_ID}::${MODULE_NAME}::Exercise`;
export const progressType = `${PACKAGE_ID}::${MODULE_NAME}::Progress`;
export const certificateType = `${PACKAGE_ID}::${MODULE_NAME}::Certificate`;
export const courseOwnerCapType = `${PACKAGE_ID}::${MODULE_NAME}::CourseOwnerCap`;
// placeholder for an administrator capability (not yet defined in the Move module)
export const adminCapType = `${PACKAGE_ID}::${MODULE_NAME}::AdminCap`;
