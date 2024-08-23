import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// GET specific student by ID
export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        console.log("Fetching student with ID:", id);

        const student = await client.student.findUnique({
            where: {
                id
            },
            include: {
                tutors: true, // Include associated tutors
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

        console.log("Fetched student data:", student);

        if (!student) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error("Error getting student:", error.message);
        return NextResponse.json({ message: "Error getting student", error: error.message }, { status: 500 });
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
            tutorIds = [],
            scheduledClassIds = [],
            archived, // Include archived field in the PATCH request
        } = body;

        console.log("Received data for update:", body);

        // Build the update data dynamically, excluding undefined values
        const updateData = {
            ...(name !== undefined && { name }),
            ...(contact !== undefined && { contact }),
            ...(archived !== undefined && { archived }), // Update archived status if provided
        };

        // Update the student with the new data
        const updatedStudent = await client.student.update({
            where: { id },
            data: updateData,
            include: {
                courses: {
                    include: {
                        course: true,
                    },
                },
                tutors: {
                    include: {
                        tutor: true,
                    },
                },
                scheduledClasses: {
                    include: {
                        scheduledClass: true,
                    },
                },
            },
        });

        console.log("Updated student:", updatedStudent);
        return NextResponse.json(updatedStudent);
    } catch (error) {
        console.error("Error updating student:", error.message);
        return NextResponse.json(
            { message: "Error updating student", error: error.message },
            { status: 500 }
        );
    }
};







export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        if (!id) {
            throw new Error("Invalid student ID");
        }

        // Delete all related StudentScheduledClass entries before deleting the student
        await client.studentScheduledClass.deleteMany({
            where: { studentId: id }
        });

        // Delete all related StudentCourse entries before deleting the student
        await client.studentCourse.deleteMany({
            where: { studentId: id }
        });

        // Now delete the student
        const deletedStudent = await client.student.delete({
            where: {
                id
            }
        });

        if (!deletedStudent) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error.message);
        return NextResponse.json({ message: "Error deleting student", error: error.message }, { status: 500 });
    }
};
