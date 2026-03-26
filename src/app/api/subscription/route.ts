/* src/app/api/subscription/route.ts */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Stripe integration - only import if credentials are available
let stripe: any = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  } catch (e) {
    console.log('Stripe not available, using demo mode');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tier, priceId } = body;

    if (!tier) {
      return NextResponse.json(
        { error: 'Tier is required' },
        { status: 400 }
      );
    }

    // Handle free tier
    if (tier === 'free') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        tier: 'free',
        message: 'Free tier activated',
      });
    }

    // For paid tiers, create Stripe checkout session
    // In production, you'd use actual Stripe price IDs
    const PRICE_IDS: Record<string, string> = {
      pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_placeholder',
    };

    const selectedPriceId = priceId || PRICE_IDS[tier];
    
    if (!selectedPriceId || selectedPriceId.includes('placeholder')) {
      // Demo mode - just update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        tier,
        message: `${tier} tier activated (demo mode)`,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/payment-result?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding?canceled=true`,
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
        tier,
      },
    });

    // Update profile with pending subscription
    await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'past_due',
        stripe_customer_id: session.customer as string || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get subscription status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tier: profile.subscription_tier,
      status: profile.subscription_status,
      stripeCustomerId: profile.stripe_customer_id,
      stripeSubscriptionId: profile.stripe_subscription_id,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}