import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Function to handle GET requests to fetch all courses
// URL: http://localhost:3000/api/courses
export const GET = async () => {
    try {
        const courses = await client.course.findMany({
            include: {
                tutors: true, // Include associated tutors if needed
                students: true, // Include associated students if needed
                scheduledClasses: true, // Include associated scheduled classes if needed
            },
        });

        return NextResponse.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { message: "Error fetching courses", error: error.message },
            { status: 500 }
        );
    }
};
