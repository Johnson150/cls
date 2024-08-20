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
            },
        });

        if (!tutor) {
            return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
        }

        return NextResponse.json(tutor);
    } catch (error) {
        return NextResponse.json({ message: "Error getting tutor", error }, { status: 500 });
    }
};

// PATCH update a tutor by ID
// PATCH update a tutor by ID
export const PATCH = async (req, { params }) => {
    try {
        const { id } = params;
        const body = await req.json();
        const { name, hoursWorked, hoursScheduled, timesBookedOff = 0, contact, studentIds, scheduledClassIds, courseIds } = body;

        // Verify that the tutor exists
        const tutorExists = await client.tutor.findUnique({
            where: { id },
            include: {
                courses: true, // Include current courses to check against new ones
            }
        });

        if (!tutorExists) {
            throw new Error("Tutor not found.");
        }

        // Prepare update data
        let updateData = {
            name,
            hoursWorked,
            hoursScheduled,
            timesBookedOff,
            contact, // Include contact in the update data
            students: {
                deleteMany: {}, // Remove all existing student relations
                create: studentIds.map((studentId) => ({
                    student: { connect: { id: studentId } }
                }))
            },
            scheduledClasses: {
                deleteMany: {}, // Remove all existing scheduled class relations
                create: scheduledClassIds.map((scheduledClassId) => ({
                    scheduledClass: { connect: { id: scheduledClassId } }
                }))
            }
        };

        // If courseIds are provided and different from current courses, update them
        if (courseIds && courseIds.length > 0) {
            const validCourseIds = courseIds.filter(courseId => courseId !== null && courseId !== undefined);

            // Verify that all courses exist
            const courseExists = await client.course.findMany({
                where: { id: { in: validCourseIds } }
            });

            if (courseExists.length !== validCourseIds.length) {
                throw new Error("One or more selected courses were not found.");
            }

            // Update course relations only if different
            const currentCourseIds = tutorExists.courses.map(tc => tc.courseId);
            const coursesChanged = validCourseIds.length !== currentCourseIds.length || !validCourseIds.every(id => currentCourseIds.includes(id));

            if (coursesChanged) {
                updateData.courses = {
                    deleteMany: {}, // Remove all existing course relations
                    create: validCourseIds.map((courseId) => ({
                        course: { connect: { id: courseId } }
                    }))
                };
            }
        }

        // Update tutor details
        const updatedTutor = await client.tutor.update({
            where: { id },
            data: updateData,
            include: {
                students: true,
                scheduledClasses: true,
                courses: {
                    include: {
                        course: true
                    }
                }
            }
        });

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

        // Delete all related TutorCourse entries before deleting the tutor
        await client.tutorCourse.deleteMany({
            where: { tutorId: id }
        });

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
        console.error("Error deleting tutor:", error);
        return NextResponse.json({ message: "Error deleting tutor", error: error.message }, { status: 500 });
    }
};
