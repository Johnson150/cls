import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Function to handle GET requests to return a specific student by ID
export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        const student = await client.student.findUnique({
            where: {
                id
            },
            include: {
                tutor: true, // Include associated tutor
                scheduledClasses: {
                    include: {
                        scheduledClass: true, // Include associated scheduled classes
                    },
                },
            },
        });

        if (!student) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        return NextResponse.json({ message: "Error getting student", error }, { status: 500 });
    }
};

// Function to handle PATCH requests to update a student record
export const PATCH = async (request, { params }) => {
    try {
        const body = await request.json();
        const { id } = params;
        const { Name, Subject, Hoursin, Hoursscheduled, tutorId } = body;

        const updatedStudent = await client.student.update({
            where: {
                id
            },
            data: {
                Name,
                Subject,
                Hoursin,
                Hoursscheduled,
                tutor: tutorId ? { connect: { id: tutorId } } : undefined,
            }
        });

        if (!updatedStudent) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(updatedStudent);
    } catch (error) {
        return NextResponse.json({ message: "Error updating student", error }, { status: 500 });
    }
};

// Function to handle DELETE requests to remove a student by ID
export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

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
        return NextResponse.json({ message: "Error deleting student", error }, { status: 500 });
    }
};

// Fetches students using the GET function
export const FETCH = async () => {
    return await GET();
};
