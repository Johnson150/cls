import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";


export const POST = async (req) => {
    try {
        const body = await req.json();
        const { classDate, duration, status, tutorIds = [], studentIds = [] } = body;

        console.log("Received data:", body);

        // Validate that status is provided and is valid
        if (!status || !['BOOKED_OFF', 'NOT_BOOKED_OFF'].includes(status)) {
            throw new Error("Invalid or missing status value.");
        }

        // Step 1: Create the ScheduledClass without any nested relations
        const newScheduledclass = await client.scheduledclass.create({
            data: {
                classDate,
                duration,
                status,
            },
        });

        console.log("Created scheduled class:", newScheduledclass);

        // Step 2: Link Tutors to the ScheduledClass
        if (tutorIds.length > 0) {
            for (let tutorId of tutorIds) {
                await client.tutorscheduledclass.create({
                    data: {
                        tutorId: tutorId,
                        scheduledClassId: newScheduledclass.id,
                    },
                });
            }
        }

        // Step 3: Link Students to the ScheduledClass
        if (studentIds.length > 0) {
            for (let studentId of studentIds) {
                await client.studentscheduledclass.create({
                    data: {
                        studentId: studentId,
                        scheduledClassId: newScheduledclass.id,
                    },
                });
            }
        }

        console.log("Linked tutors and students to scheduled class.");
        return NextResponse.json(newScheduledclass);
    } catch (error) {
        console.error("Error creating scheduled class:", error.message);
        return NextResponse.json(
            { message: "Error creating scheduled class", error: error.message },
            { status: 500 }
        );
    }
};

// Function to handle GET requests to fetch all courses
export const GET = async (req) => {
    try {
        const courses = await client.course.findMany();
        if (courses.length === 0) {
            return NextResponse.json({ message: "No courses available" }, { status: 404 });
        }
        return NextResponse.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        return NextResponse.json(
            { message: "Error fetching courses", error: error.message },
            { status: 500 }
        );
    }
};