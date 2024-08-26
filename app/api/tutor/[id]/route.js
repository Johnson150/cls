import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// GET specific tutor by ID
export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        const tutor = await client.tutor.findUnique({
            where: {
                id
            },
            include: {
                students: true, // Include associated students
                scheduledClasses: {
                    include: {
                        scheduledClass: true, // Include associated scheduled classes
                    },
                },
                courses: {
                    include: {
                        course: true, // Include associated courses
                    },
                },
            },
        });

        if (!tutor) {
            return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
        }

        return NextResponse.json(tutor);
    } catch (error) {
        return NextResponse.json({ message: "Error getting tutor", error: error.message }, { status: 500 });
    }
};

export const PATCH = async (req, { params }) => {
    try {
        const { id } = params;
        const body = await req.json();
        const {
            name,
            contact,
            courseIds = [],
            studentIds = [],
            scheduledClassIds = [],
            archived,
        } = body;

        console.log("Received data for update:", body);

        // Build the update data dynamically, excluding undefined values
        const updateData = {
            ...(name !== undefined && { name }),
            ...(contact !== undefined && { contact }),
            ...(archived !== undefined && { archived }),
        };

        // Fetch the current tutor details
        const existingTutor = await client.tutor.findUnique({
            where: { id },
            include: {
                courses: true,
                students: true,
                scheduledClasses: true,
            },
        });

        if (!existingTutor) {
            throw new Error("Tutor not found");
        }

        // Handle course updates only if courseIds are provided
        if (courseIds.length > 0) {
            // Disconnect existing courses
            await client.tutorCourse.deleteMany({
                where: { tutorId: id },
            });

            // Connect new courses
            const courseConnections = courseIds.map(courseId => ({
                tutorId: id,
                courseId,
            }));

            await client.tutorCourse.createMany({
                data: courseConnections,
            });
        }

        // Handle student updates only if studentIds are provided
        if (studentIds.length > 0) {
            // Disconnect existing students
            await client.tutorStudent.deleteMany({
                where: { tutorId: id },
            });

            // Connect new students
            const studentConnections = studentIds.map(studentId => ({
                tutorId: id,
                studentId,
            }));

            await client.tutorStudent.createMany({
                data: studentConnections,
            });
        }

        // Handle scheduled class updates only if scheduledClassIds are provided
        if (scheduledClassIds.length > 0) {
            // Disconnect existing scheduled classes
            await client.tutorScheduledClass.deleteMany({
                where: { tutorId: id },
            });

            // Connect new scheduled classes
            const scheduledClassConnections = scheduledClassIds.map(scheduledClassId => ({
                tutorId: id,
                scheduledClassId,
            }));

            await client.tutorScheduledClass.createMany({
                data: scheduledClassConnections,
            });
        }

        // Update the tutor with the remaining data (name, contact, archived)
        const updatedTutor = await client.tutor.update({
            where: { id },
            data: updateData,
            include: {
                courses: {
                    include: {
                        course: true,
                    },
                },
                students: true,
                scheduledClasses: {
                    include: {
                        scheduledClass: true,
                    },
                },
            },
        });

        console.log("Updated tutor:", updatedTutor);
        return NextResponse.json(updatedTutor);
    } catch (error) {
        console.error("Error updating tutor:", error.message);
        return NextResponse.json(
            { message: "Error updating tutor", error: error.message },
            { status: 500 }
        );
    }
};


// DELETE a tutor by ID
export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        if (!id) {
            throw new Error("Invalid tutor ID");
        }

        // Delete all related TutorScheduledClass entries before deleting the tutor
        await client.tutorScheduledClass.deleteMany({
            where: { tutorId: id }
        });

        // Delete all related TutorCourse entries before deleting the tutor
        await client.tutorCourse.deleteMany({
            where: { tutorId: id }
        });

        // Now delete the tutor
        const deletedTutor = await client.tutor.delete({
            where: {
                id
            }
        });

        if (!deletedTutor) {
            return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Tutor deleted successfully" });
    } catch (error) {
        console.error("Error deleting tutor:", error.message);
        return NextResponse.json({ message: "Error deleting tutor", error: error.message }, { status: 500 });
    }
};