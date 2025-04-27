import { prisma } from "../lib/prisma";

/**
 * Retrieves a user by their unique identifier
 * @param id - The unique identifier of the user to retrieve
 * @returns A Promise that resolves to the user object if found, null otherwise
 * @throws {Error} If there's a database error
 */
export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
};

/**
 * Updates a user's information in the database
 * @param id - The unique identifier of the user to update
 * @param data - An object containing the fields to update (name and/or email)
 * @returns A Promise that resolves to the updated user object
 * @throws {Error} If the user is not found or if there's a database error
 */
export const updateUser = async (
  id: string,
  data: Partial<{ name: string; email: string }>
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const updatedData = {
    ...existingUser,
    ...data,
  };

  return prisma.user.update({
    where: { id },
    data: updatedData,
    select: { id: true, name: true, email: true, role: true },
  });
};

/**
 * Deletes a user from the database
 * @param id - The unique identifier of the user to delete
 * @returns A Promise that resolves to the deleted user object
 * @throws {Error} If the user is not found or if there's a database error
 */
export const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};
