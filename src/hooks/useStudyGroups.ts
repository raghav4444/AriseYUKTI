import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { StudyGroup, User } from '../types';

export const useStudyGroups = () => {
  const { user } = useAuth();
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // Get auth user_id from session
  useEffect(() => {
    const getAuthUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuthUserId(session.user.id);
      }
    };
    getAuthUserId();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuthUserId(session.user.id);
      } else {
        setAuthUserId(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for when database is not available
  const mockStudyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'Data Structures & Algorithms Mastery',
      subject: 'Computer Science',
      description: 'Weekly problem-solving sessions focusing on coding interview preparation and algorithmic thinking.',
      members: [
        {
          id: '1',
          name: 'Sarah Chen',
          email: 'sarah@mit.edu',
          college: 'MIT',
          branch: 'Computer Science',
          year: 3,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        },
        {
          id: '2',
          name: 'Mike Johnson',
          email: 'mike@stanford.edu',
          college: 'Stanford',
          branch: 'Computer Science',
          year: 2,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        }
      ],
      maxMembers: 15,
      createdBy: {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah@mit.edu',
        college: 'MIT',
        branch: 'Computer Science',
        year: 3,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      isPrivate: false,
      tags: ['DSA', 'Coding', 'Interview Prep'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Quantum Physics Discussion Circle',
      subject: 'Physics',
      description: 'Deep dive into quantum mechanics concepts, problem-solving, and research discussions.',
      members: [
        {
          id: '3',
          name: 'Alex Rodriguez',
          email: 'alex@caltech.edu',
          college: 'Caltech',
          branch: 'Physics',
          year: 4,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        }
      ],
      maxMembers: 10,
      createdBy: {
        id: '3',
        name: 'Alex Rodriguez',
        email: 'alex@caltech.edu',
        college: 'Caltech',
        branch: 'Physics',
        year: 4,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      isPrivate: true,
      tags: ['Quantum', 'Physics', 'Research'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'Mechanical Design Project Team',
      subject: 'Mechanical Engineering',
      description: 'Collaborative group working on innovative mechanical design projects and CAD modeling.',
      members: [
        {
          id: '4',
          name: 'Emily Wang',
          email: 'emily@stanford.edu',
          college: 'Stanford',
          branch: 'Mechanical Engineering',
          year: 3,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        }
      ],
      maxMembers: 8,
      createdBy: {
        id: '4',
        name: 'Emily Wang',
        email: 'emily@stanford.edu',
        college: 'Stanford',
        branch: 'Mechanical Engineering',
        year: 3,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      isPrivate: false,
      tags: ['CAD', 'Design', 'Projects'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  const fetchStudyGroups = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setStudyGroups([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from database first
      // Note: creator_id references auth.users, so we need to join through profiles using user_id
      const { data: groupsData, error: groupsError } = await supabase
        .from('study_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) {
        throw groupsError;
      }

      if (!groupsData || groupsData.length === 0) {
        setStudyGroups([]);
        setLoading(false);
        return;
      }

      // Fetch creator profiles separately
      const creatorIds = [...new Set(groupsData.map((g: any) => g.creator_id).filter(Boolean))];
      const { data: creatorProfiles } = creatorIds.length > 0 ? await supabase
        .from('profiles')
        .select('id, user_id, name, email, college, branch, year, is_verified, avatar_url')
        .in('user_id', creatorIds) : { data: [] };

      // Fetch members for all groups
      const groupIds = groupsData.map((g: any) => g.id);
      const { data: membersData } = groupIds.length > 0 ? await supabase
        .from('study_group_members')
        .select(`
          group_id,
          user_id,
          profiles!study_group_members_user_id_fkey (
            id,
            name,
            email,
            college,
            branch,
            year,
            is_verified,
            avatar_url
          )
        `)
        .in('group_id', groupIds) : { data: [] };

      // Map members by group_id
      const membersByGroup = new Map<string, any[]>();
      membersData?.forEach((member: any) => {
        if (!membersByGroup.has(member.group_id)) {
          membersByGroup.set(member.group_id, []);
        }
        if (member.profiles) {
          membersByGroup.get(member.group_id)?.push(member.profiles);
        }
      });

      // Map creator profiles by user_id
      const creatorByUserId = new Map<string, any>();
      creatorProfiles?.forEach((profile: any) => {
        creatorByUserId.set(profile.user_id, profile);
      });

      const data = groupsData.map((group: any) => ({
        ...group,
        profiles: creatorByUserId.get(group.creator_id) || null,
        study_group_members: membersByGroup.get(group.id) || [],
      }));

      if (error) {
        console.error('Error fetching study groups:', error);
        // If table doesn't exist or RLS blocks, show error but allow mock data fallback
        if (error.code === 'PGRST116' || error.message.includes('permission denied') || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.warn('Study groups table not available, using mock data:', error.message);
          setStudyGroups(mockStudyGroups);
          setLoading(false);
          return;
        }
        setError(error.message);
        setStudyGroups([]);
        setLoading(false);
        return;
      }

      // Handle empty data
      if (!data || data.length === 0) {
        console.log('No study groups found in database');
        setStudyGroups([]);
        setLoading(false);
        return;
      }

      const formattedGroups: StudyGroup[] = data?.map((group: any) => {
        // Handle both old (created_by) and new (creator_id) field names
        const creatorProfile = group.profiles || (group.creator_id ? null : null);
        
        return {
          id: group.id,
          name: group.name,
          subject: group.subject,
          description: group.description,
          members: group.study_group_members?.map((member: any) => ({
            id: member.profiles.id,
            name: member.profiles.name,
            email: member.profiles.email,
            college: member.profiles.college,
            branch: member.profiles.branch,
            year: member.profiles.year,
            isVerified: member.profiles.is_verified,
            isAnonymous: false,
            avatar: member.profiles.avatar_url,
            joinedAt: new Date(),
            lastActive: new Date(),
          })) || [],
          maxMembers: group.max_members,
          createdBy: creatorProfile ? {
            id: creatorProfile.id,
            name: creatorProfile.name,
            email: creatorProfile.email,
            college: creatorProfile.college,
            branch: creatorProfile.branch,
            year: creatorProfile.year,
            isVerified: creatorProfile.is_verified,
            isAnonymous: false,
            avatar: creatorProfile.avatar_url,
            joinedAt: new Date(),
            lastActive: new Date(),
          } : {
            // Fallback if profile not loaded
            id: user?.id || '',
            name: user?.name || 'Unknown',
            email: user?.email || '',
            college: user?.college || '',
            branch: user?.branch || '',
            year: user?.year || 1,
            isVerified: user?.isVerified || false,
            isAnonymous: false,
            joinedAt: new Date(),
            lastActive: new Date(),
          },
          isPrivate: group.is_private,
          tags: group.tags || [],
          createdAt: new Date(group.created_at),
        };
      }) || [];

      setStudyGroups(formattedGroups);
    } catch (err) {
      console.warn('Error fetching study groups, using mock data:', err);
      // Use mock data as fallback
      setStudyGroups(mockStudyGroups);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudyGroups();
  }, [fetchStudyGroups]);

  const createStudyGroup = async (groupData: {
    name: string;
    subject: string;
    description: string;
    maxMembers: number;
    isPrivate: boolean;
    tags: string[];
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Creating study group:', groupData);
      
      // Get auth user_id if not already set
      let creatorId = authUserId;
      if (!creatorId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('User session not found');
        }
        creatorId = session.user.id;
      }

      // Try to create in database first
      const { data, error } = await supabase
        .from('study_groups')
        .insert({
          name: groupData.name,
          subject: groupData.subject,
          description: groupData.description,
          max_members: groupData.maxMembers,
          is_private: groupData.isPrivate,
          tags: groupData.tags,
          creator_id: creatorId, // Use creator_id (auth user_id) as per schema
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating study group:', error);
        
        // Check if it's a table/permission error vs validation error
        if (error.code === 'PGRST116' || error.message.includes('permission denied') || error.message.includes('relation') || error.message.includes('does not exist')) {
          // Table doesn't exist or permission issue - use mock fallback
          console.warn('Database table not available, using mock data for creation');
          const newGroup: StudyGroup = {
            id: Date.now().toString(),
            name: groupData.name,
            subject: groupData.subject,
            description: groupData.description,
            maxMembers: groupData.maxMembers,
            isPrivate: groupData.isPrivate,
            tags: groupData.tags,
            members: [{
              id: user.id,
              name: user.name || 'You',
              email: user.email || '',
              college: user.college || '',
              branch: user.branch || '',
              year: user.year || 1,
              isVerified: user.isVerified || false,
              isAnonymous: false,
              joinedAt: new Date(),
              lastActive: new Date(),
            }],
            createdBy: {
              id: user.id,
              name: user.name || 'You',
              email: user.email || '',
              college: user.college || '',
              branch: user.branch || '',
              year: user.year || 1,
              isVerified: user.isVerified || false,
              isAnonymous: false,
              joinedAt: new Date(),
              lastActive: new Date(),
            },
            createdAt: new Date(),
          };
          
          setStudyGroups(prev => [newGroup, ...prev]);
          return newGroup;
        } else {
          // Other errors (validation, constraint violations, etc.) - throw them
          throw new Error(error.message || 'Failed to create study group');
        }
      }

      if (!data) {
        throw new Error('Failed to create study group: No data returned');
      }

      console.log('Study group created successfully:', data.id);

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: data.id,
          user_id: creatorId, // Use auth user_id
          role: 'admin',
        });

      if (memberError) {
        console.warn('Failed to add creator as member:', memberError);
        // Don't throw - group was created successfully, just member addition failed
      }

      // Refetch groups to get the complete data with relations
      await fetchStudyGroups();
      
      return data;
    } catch (err) {
      console.error('Error creating study group:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create study group';
      throw new Error(errorMessage);
    }
  };

  const joinStudyGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get auth user_id if not already set
      let currentAuthUserId = authUserId;
      if (!currentAuthUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('User session not found');
        }
        currentAuthUserId = session.user.id;
      }

      // Try to join in database first
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: currentAuthUserId, // Use auth user_id
          role: 'member',
        });

      if (error) {
        console.warn('Database not available, using mock data for join');
        // Update mock data
        setStudyGroups(prev => prev.map(group => {
          if (group.id === groupId && !group.members.some(member => member.id === user.id)) {
            return {
              ...group,
              members: [...group.members, {
                id: user.id,
                name: user.name || 'You',
                email: user.email || '',
                college: user.college || '',
                branch: user.branch || '',
                year: user.year || 1,
                isVerified: user.isVerified || false,
                isAnonymous: false,
                joinedAt: new Date(),
                lastActive: new Date(),
              }]
            };
          }
          return group;
        }));
        return;
      }

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error joining study group:', err);
      throw err;
    }
  };

  const leaveStudyGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get auth user_id if not already set
      let currentAuthUserId = authUserId;
      if (!currentAuthUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('User session not found');
        }
        currentAuthUserId = session.user.id;
      }

      // Try to leave in database first
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentAuthUserId); // Use auth user_id

      if (error) {
        console.warn('Database not available, using mock data for leave');
        // Update mock data
        setStudyGroups(prev => prev.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              members: group.members.filter(member => member.id !== user.id)
            };
          }
          return group;
        }));
        return;
      }

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error leaving study group:', err);
      throw err;
    }
  };

  const updateStudyGroup = async (groupId: string, updates: Partial<{
    name: string;
    subject: string;
    description: string;
    maxMembers: number;
    isPrivate: boolean;
    tags: string[];
  }>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get auth user_id if not already set
      let currentAuthUserId = authUserId;
      if (!currentAuthUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('User session not found');
        }
        currentAuthUserId = session.user.id;
      }

      const { error } = await supabase
        .from('study_groups')
        .update({
          name: updates.name,
          subject: updates.subject,
          description: updates.description,
          max_members: updates.maxMembers,
          is_private: updates.isPrivate,
          tags: updates.tags,
        })
        .eq('id', groupId)
        .eq('creator_id', currentAuthUserId);

      if (error) throw error;

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error updating study group:', err);
      throw err;
    }
  };

  const deleteStudyGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get auth user_id if not already set
      let currentAuthUserId = authUserId;
      if (!currentAuthUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('User session not found');
        }
        currentAuthUserId = session.user.id;
      }

      // Delete all members first
      await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId);

      // Delete the group
      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId)
        .eq('creator_id', currentAuthUserId);

      if (error) throw error;

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error deleting study group:', err);
      throw err;
    }
  };

  const isUserMember = (groupId: string) => {
    if (!user) return false;
    const group = studyGroups.find(g => g.id === groupId);
    return group?.members.some(member => member.id === user.id) || false;
  };

  const isUserAdmin = (groupId: string) => {
    if (!user) return false;
    const group = studyGroups.find(g => g.id === groupId);
    return group?.createdBy.id === user.id;
  };

  return {
    studyGroups,
    loading,
    error,
    createStudyGroup,
    joinStudyGroup,
    leaveStudyGroup,
    updateStudyGroup,
    deleteStudyGroup,
    isUserMember,
    isUserAdmin,
    refetch: fetchStudyGroups,
  };
};
