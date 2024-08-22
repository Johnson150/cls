import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";


// POST - Create a new student
export const POST = async (req) => {
    try {
        const body = await req.json();
        const { name, hoursIn = 0, hoursScheduled = 0, timesBookedOff = 0, contact, tutorIds = [], scheduledClassIds = [], courseIds = [] } = body;

        console.log("Received data:", body);

        // Verify that all courses exist
        const existingCourses = await client.course.findMany({
            where: { id: { in: courseIds } }
        });

        if (existingCourses.length !== courseIds.length) {
            console.error("Some courses were not found in the database");
            throw new Error("One or more selected courses were not found.");
        }

        // Proceed to create the student with the associated tutors, courses, and scheduled classes
        const newStudent = await client.student.create({
            data: {
                name,
                hoursIn,
                hoursScheduled,
                timesBookedOff,
                contact,
                // Conditionally connect tutors if any
                ...(tutorIds.length > 0 && {
                    tutors: {
                        connect: tutorIds.map((tutorId) => ({
                            id: tutorId,
                        })),
                    },
                }),
                // Conditionally connect scheduled classes if any
                ...(scheduledClassIds.length > 0 && {
                    scheduledClasses: {
                        connect: scheduledClassIds.map((scheduledClassId) => ({
                            id: scheduledClassId,
                        })),
                    },
                }),
                // Use create to establish the relationship in the join table
                courses: {
                    create: existingCourses.map((course) => ({
                        course: {
                            connect: { id: course.id }
                        }
                    })),
                },
            },
        });

        console.log("Created student:", newStudent);
        return NextResponse.json(newStudent);
    } catch (error) {
        console.error("Error creating student:", error.message);
        return NextResponse.json(
            { message: "Error creating student", error: error.message },
            { status: 500 }
        );
    }
};


export const GET = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const courseIdsParam = searchParams.get('courseIds');
        const scheduleIdParam = searchParams.get('scheduleId');
        const courseIds = courseIdsParam ? courseIdsParam.split(',') : [];

        console.log('Incoming parameters:', { courseIdsParam, scheduleIdParam });

        let students;

        if (scheduleIdParam) {
            console.log('Fetching students by scheduleId:', scheduleIdParam);

            students = await client.student.findMany({
                where: {
                    scheduledClasses: {
                        some: {
                            scheduledClassId: scheduleIdParam,
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    hoursIn: true,
                    hoursScheduled: true,
                    timesBookedOff: true,
                    contact: true,
                    tutors: {
                        select: {
                            id: true,
                            tutor: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    scheduledClasses: {
                        select: {
                            id: true,
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!students.length) {
                console.log('No students found for this scheduled class');
                return NextResponse.json({ message: "No students found for this scheduled class" }, { status: 404 });
            }
        } else if (courseIds.length > 0) {
            console.log('Fetching students by courseIds:', courseIds);

            students = await client.student.findMany({
                where: {
                    courses: {
                        some: {
                            courseId: { in: courseIds }, // Make sure `courseId` is the correct field
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    hoursIn: true,
                    hoursScheduled: true,
                    timesBookedOff: true,
                    contact: true,
                    tutors: {
                        select: {
                            id: true,
                            tutor: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    scheduledClasses: {
                        select: {
                            id: true,
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!students.length) {
                console.log('No students found for these courses');
                return NextResponse.json({ message: "No students found for these courses" }, { status: 404 });
            }
        } else {
            console.log('Fetching all students');

            students = await client.student.findMany({
                select: {
                    id: true,
                    name: true,
                    hoursIn: true,
                    hoursScheduled: true,
                    timesBookedOff: true,
                    contact: true,
                    tutors: {
                        select: {
                            id: true,
                            tutor: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    scheduledClasses: {
                        select: {
                            id: true,
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        console.log('Students fetched:', students.length);
        return NextResponse.json(students);
    } catch (error) {
        console.error("Error fetching students:", error.message);
        return NextResponse.json(
            { message: "Error fetching students", error: error.message },
            { status: 500 }
        );
    }
};




