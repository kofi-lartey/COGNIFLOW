/* src/app/api/onboarding/route.ts */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Get current user's onboarding status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      onboardingStep: profile.onboarding_step || 1,
      onboardingCompleted: profile.onboarding_completed || false,
      workspaceName: profile.workspace_name,
      subscriptionTier: profile.subscription_tier,
      subscriptionStatus: profile.subscription_status,
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update onboarding progress
export async function PUT(request: NextRequest) {
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
    const { 
      step, 
      completed, 
      workspaceName,
      bio,
      organization 
    } = body;

    // Build update object
    const updates: Record<string, any> = {};
    
    if (step !== undefined) {
      updates.onboarding_step = step;
    }
    if (completed !== undefined) {
      updates.onboarding_completed = completed;
    }
    if (workspaceName !== undefined) {
      updates.workspace_name = workspaceName;
    }
    if (bio !== undefined) {
      updates.bio = bio;
    }
    if (organization !== undefined) {
      updates.organization = organization;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
    });
  } catch (error) {
    console.error('Onboarding update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}