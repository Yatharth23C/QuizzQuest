import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb'; 
import { getServerSession } from 'next-auth';
import {options} from '../[...nextauth]/options'


export async function POST(req) {
  try {
    const session  = await getServerSession(options);
    if(!session || !session.user){
      return NextResponse.json({error:'Not authenticated'},{status:401})
    }

    const client = await clientPromise;
    const db = client.db('QuizApp_users');
    const questionsCollection = db.collection('user_credentials');
    const userEmail = session.user.email

    const body = await req.json();  // Parse the request body
    console.log(body)
    const {questions} = body
    const {question , Options,answer} = questions[0];     // Extract the array of questions
    
    const finalquestion = {
      question,
      Options,
      answer,
      email :userEmail,
      createdAt : new Date()
    }
    // Insert the questions array into MongoDB
    const result = await questionsCollection.insertOne(finalquestion);

    return NextResponse.json({ message: 'Questions added successfully', result });
  } catch (error) {
    console.error('Error inserting questions:', error);
    return NextResponse.json({ error: 'Failed to add questions' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(options);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const client = await clientPromise;
    const db = client.db('QuizApp_users');
    
    // Check if the user is a teacher
    const isTeacher = await db.collection('teachers').findOne({ email: userEmail });
    // Check if the user is a student
    const isStudent = await db.collection('students').findOne({ email: userEmail });
    
    let questions;

    if (isTeacher) {
      // If the user is a teacher, return all questions (or any specific logic you want for teachers)
      questions = await db.collection('user_credentials').find({ email: userEmail }).toArray();
    } else if (isStudent) {
      // If the user is a student, return questions excluding the answer
      questions = await db.collection('user_credentials').find({}).toArray();
    } else {
      return NextResponse.json({ error: 'User role not recognized' }, { status: 403 });
    }
    
    return NextResponse.json({ questions });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json({ error: 'Error fetching questions' }, { status: 500 });
  }
}

