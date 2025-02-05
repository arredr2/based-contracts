import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, inviteLink, projectDetails, isResend } = body;

    // Here you would integrate with your email service provider
    // For example, using SendGrid, Postmark, etc.
    // This is a placeholder for the email sending logic
    
    console.log('Sending email to:', email);
    console.log('Invite link:', inviteLink);
    console.log('Project details:', projectDetails);
    console.log('Is resend:', isResend);

    // Example email content
    const emailContent = {
      to: email,
      subject: isResend 
        ? 'Reminder: You have a pending contractor invitation'
        : 'You have been invited to join a project on BasedContracts',
      text: `
        You have been invited to join a project on BasedContracts.
        
        Project Details:
        ${projectDetails}
        
        Click the following link to join:
        ${inviteLink}
        
        This link will expire in 7 days.
      `.trim(),
      // Add HTML version if needed
    };

    // In production, integrate with email service:
    // await sendEmail(emailContent);

    return NextResponse.json(
      { success: true },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
