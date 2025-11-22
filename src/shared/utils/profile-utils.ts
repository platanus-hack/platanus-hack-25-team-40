import { supabase } from "./supabase";

export async function ensureProfileExists(userId: string): Promise<boolean> {
  try {
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('patient_profiles')
      .select('id, is_complete')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code === 'PGRST116') {
      // No profile found, create one
      console.log('No profile found, creating basic profile...');
      const { error: insertError } = await supabase
        .from('patient_profiles')
        .insert({
          user_id: userId,
          name: '',
          last_name: '',
          birth_date: new Date().toISOString().split('T')[0],
          biological_sex: 'not_specified',
          is_complete: false
        });
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        return false;
      }
      return false; // Profile created but not complete
    }
    
    if (profileError) {
      console.error('Error checking profile:', profileError);
      return false;
    }
    
    return profileData?.is_complete ?? false;
  } catch (err) {
    console.error('Unexpected error in ensureProfileExists:', err);
    return false;
  }
}
