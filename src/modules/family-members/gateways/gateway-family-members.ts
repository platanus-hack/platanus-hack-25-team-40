import type {
  FamilyMember,
  CreateFamilyLinkInput,
  UpdateFamilyLinkInput,
} from "../types";
import { FamilyRole } from "../types";
import { supabase } from "@/shared/utils/supabase";

/**
 * Gateway for family members data access
 * This is a mock implementation - replace with Supabase calls
 */
export class FamilyMembersGateway {
  async list(userId: string): Promise<FamilyMember[]> {
    try {
      // Use the view that joins family_links with user information
      const { data, error } = await supabase
        .from('family_members_with_details')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching family members:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((member) => ({
        id: member.id,
        userId: member.relative_user_id,
        email: member.relative_email || 'unknown@example.com',
        name: member.relative_name || 'Unknown User',
        role: member.role as FamilyRole,
        linkedBy: member.user_id,
        createdAt: member.created_at,
        updatedAt: member.created_at,
      }));
    } catch (error) {
      console.error('Error in list:', error);
      return [];
    }
  }

  async getById(id: string): Promise<FamilyMember | null> {
    try {
      const { data, error } = await supabase
        .from('family_members_with_details')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching family member:', error);
        return null;
      }

      return {
        id: data.id,
        userId: data.relative_user_id,
        email: data.relative_email || 'unknown@example.com',
        name: data.relative_name || 'Unknown User',
        role: data.role as FamilyRole,
        linkedBy: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.created_at,
      };
    } catch (error) {
      console.error('Error in getById:', error);
      return null;
    }
  }

  async create(
    userId: string,
    input: CreateFamilyLinkInput
  ): Promise<FamilyMember> {
    try {
      // First, check if the user exists by email
      const searchResult = await this.searchByEmail(input.email);
      
      if (!searchResult || !searchResult.exists || !searchResult.userId) {
        throw new Error('User not found. They must be registered in Oregon Health first.');
      }

      // Create the family link
      const { data, error } = await supabase
        .from('family_links')
        .insert({
          user_id: userId,
          relative_user_id: searchResult.userId,
          role: input.role,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating family link:', error);
        throw error;
      }

      return {
        id: data.id,
        userId: data.relative_user_id,
        email: input.email,
        name: input.name,
        role: data.role as FamilyRole,
        linkedBy: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.created_at,
      };
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async update(input: UpdateFamilyLinkInput): Promise<FamilyMember> {
    try {
      const updateData: Record<string, unknown> = {};
      if (input.role) updateData.role = input.role;

      const { data, error } = await supabase
        .from('family_links')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating family link:', error);
        throw error;
      }

      // Get updated member details from the view
      const { data: memberData } = await supabase
        .from('family_members_with_details')
        .select('*')
        .eq('id', input.id)
        .single();

      if (memberData) {
        return {
          id: memberData.id,
          userId: memberData.relative_user_id,
          email: memberData.relative_email || 'unknown@example.com',
          name: memberData.relative_name || input.name || 'Unknown',
          role: memberData.role as FamilyRole,
          linkedBy: memberData.user_id,
          createdAt: memberData.created_at,
          updatedAt: memberData.created_at,
        };
      }

      // Fallback if view query fails
      return {
        id: data.id,
        userId: data.relative_user_id,
        email: 'unknown@example.com',
        name: input.name || 'Unknown',
        role: data.role as FamilyRole,
        linkedBy: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.created_at,
      };
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('family_links')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting family link:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  async searchByEmail(query: string): Promise<{ exists: boolean; userId?: string; email: string; name?: string } | null> {
    try {
      // Use the database function to search for users by email or name
      const { data, error } = await supabase
        .rpc('search_user_by_email', { search_email: query });

      if (error) {
        console.error('Error searching for user:', error);
        return { exists: false, email: query };
      }

      if (data && data.length > 0) {
        const user = data[0];
        return {
          exists: true,
          userId: user.user_id,
          email: user.email,
          name: user.full_name,
        };
      }

      return { exists: false, email: query };
    } catch (error) {
      console.error('Error in searchByEmail:', error);
      return null;
    }
  }
}
