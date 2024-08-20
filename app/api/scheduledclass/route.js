import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const body = await req.json();
        let { classDate, duration, status, tutorIds = [], studentIds = [] } = body;

        console.log("Received data:", body);

        // Validate that status is provided and is valid
        if (!status || !['BOOKED_OFF', 'NOT_BOOKED_OFF'].includes(status)) {
            throw new Error("Invalid or missing status value.");
        }

        // Convert classDate to ISO-8601 string if it's not already
        if (typeof classDate === 'string') {
            classDate = new Date(classDate).toISOString();
        } else if (classDate instanceof Date) {
            classDate = classDate.toISOString();
        } else {
            throw new Error("Invalid date format for classDate.");
        }

        console.log("Formatted classDate:", classDate);

        // Create the scheduled class without any nested relations first
        const newScheduledClass = await client.scheduledClass.create({
            data: {
                classDate,
                duration,
                status,
            },
        });

        console.log("Created scheduled class:", newScheduledClass);

        // Link tutors to the scheduled class
        if (tutorIds.length > 0) {
            for (const tutorId of tutorIds) {
                const tutorLink = await client.tutorScheduledClass.create({
                    data: {
                        tutorId,
                        scheduledClassId: newScheduledClass.id,
                    },
                });
                console.log("Tutor Linked:", tutorLink);
            }
        }

        // Link students to the scheduled class
        if (studentIds.length > 0) {
            for (const studentId of studentIds) {
                const studentLink = await client.studentScheduledClass.create({
                    data: {
                        studentId,
                        scheduledClassId: newScheduledClass.id,
                    },
                });
                console.log("Student Linked:", studentLink);
            }
        }

        return NextResponse.json(newScheduledClass);
    } catch (error) {
        console.error("Error creating scheduled class:", error.message);
        return NextResponse.json(
            { message: "Error creating scheduled class", error: error.message },
            { status: 500 }
        );
    }
};



export const GET = async (req) => {
    try {
        const scheduledClasses = await client.scheduledclass.findMany({
            include: {
                tutors: {
                    include: {
                        tutor: {
                            select: {
                                id: true,
                                name: true,
                                contact: true,
                            }
                        }
                    }
                },
                students: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                contact: true,
                            }
                        }
                    }
                },
                course: {
                    select: {
                        id: true,
                        courseName: true,
                    }
                },
            },
        });

        return NextResponse.json(scheduledClasses);
    } catch (error) {
        console.error("Error fetching scheduled classes:", error.message);
        return NextResponse.json(
            { message: "Error fetching scheduled classes", error: error.message },
            { status: 500 }
        );
    }
};