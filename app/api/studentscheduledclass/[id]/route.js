import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// GET specific student-scheduled class relationship by ID
export const GET = async (request, { params }) => {
    try {
        const { id } = params;

        const studentScheduledClass = await client.studentScheduledClass.findUnique({
            where: {
                id
            },
            include: {
                student: true,
                scheduledClass: true
            }
        });

        if (!studentScheduledClass) {
            return NextResponse.json({ message: "Student-scheduled class relationship not found" }, { status: 404 });
        }

        return NextResponse.json(studentScheduledClass);
    } catch (error) {
        return NextResponse.json({ message: "Error getting student-scheduled class relationship", error }, { status: 500 });
    }
};

// DELETE a student-scheduled class relationship by ID
export const DELETE = async (request, { params }) => {
    try {
        const { id } = params;

        const deletedStudentScheduledClass = await client.studentScheduledClass.delete({
            where: {
                id
            }
        });

        if (!deletedStudentScheduledClass) {
            return NextResponse.json({ message: "Student-scheduled class relationship not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Student-scheduled class relationship deleted successfully" });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting student-scheduled class relationship", error }, { status: 500 });
    }
};
