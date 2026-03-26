/* src/app/api/payment/verify/route.ts */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Paystack API base URL
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * API Route: POST /api/payment/verify
 * 
 * Verifies a Paystack transaction and updates user subscription
 * 
 * Request Body:
 * {
 *   reference: string,  // Paystack transaction reference
 *   plan: string        // Plan name (e.g., "Obsidian Prime")
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data?: {
 *     reference: string,
 *     status: string,
 *     amount: number,
 *     customerEmail: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, plan } = body;

    // Validate required fields
    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    // Get Paystack secret key from environment
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return NextResponse.json(
        { success: false, message: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paystackData = await paystackResponse.json();

    // Check if Paystack verification was successful
    if (!paystackData.status || paystackData.data?.status !== 'success') {
      console.error('Paystack verification failed:', paystackData);
      return NextResponse.json(
        { 
          success: false, 
          message: paystackData.message || 'Payment verification failed',
          data: {
            reference,
            status: paystackData.data?.status || 'failed'
          }
        },
        { status: 400 }
      );
    }

    // Payment verified - extract transaction details
    const transaction = paystackData.data;
    const amount = transaction.amount / 100; // Convert from minor units
    const customerEmail = transaction.customer?.email || transaction.customer_email;

    console.log('Payment verified:', {
      reference: transaction.reference,
      amount,
      currency: transaction.currency,
      status: transaction.status,
      email: customerEmail
    });

    // Get authorization header for user verification
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader) {
      // Verify user from token
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (!authError && user) {
        userId = user.id;
      }
    }

    // If no authenticated user, try to find by email in profiles
    if (!userId && customerEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (profile) {
        userId = profile.id;
      }
    }

    // Update subscription status in database
    if (userId) {
      // Determine tier based on plan
      const tierMap: Record<string, string> = {
        'Obsidian Prime': 'obsidian',
        'Obsidian Pro': 'pro',
        'Obsidian Enterprise': 'enterprise',
        'Pro': 'pro',
        'Enterprise': 'enterprise',
        'Free': 'free'
      };

      const tier = tierMap[plan || ''] || 'obsidian';

      // Update or insert subscription record
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          tier: tier,
          status: 'active',
          plan_id: transaction.reference,
          amount: Math.round(amount * 100), // Store in cents
          currency: transaction.currency || 'GHS',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (subscriptionError) {
        console.error('Subscription update error:', subscriptionError);
        // Continue - payment is verified even if DB update fails
      }

      // Update profile with subscription info
      await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Store payment reference in localStorage (for mock auth fallback)
      if (typeof window !== 'undefined') {
        localStorage.setItem('payment_completed', 'true');
        localStorage.setItem('payment_reference', transaction.reference);
        localStorage.setItem('subscription_tier', tier);
        localStorage.setItem('subscription_status', 'active');
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        reference: transaction.reference,
        status: transaction.status,
        amount: amount,
        currency: transaction.currency,
        customerEmail: customerEmail,
        plan: plan || 'Obsidian Prime'
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for checking payment status
 * Can be used for webhook fallback or status checks
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json(
      { success: false, message: 'Reference is required' },
      { status: 400 }
    );
  }

  // Verify with Paystack
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  
  if (!paystackSecretKey) {
    return NextResponse.json(
      { success: false, message: 'Payment configuration error' },
      { status: 500 }
    );
  }

  try {
    const paystackResponse = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const data = await paystackResponse.json();

    return NextResponse.json({
      success: data.status,
      data: data.data
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to verify transaction' },
      { status: 500 }
    );
  }
}