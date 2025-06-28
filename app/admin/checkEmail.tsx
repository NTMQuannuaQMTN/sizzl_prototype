import { supabase } from "@/utils/supabase";

export const getSchoolFromEmail = async (email: string) => {
    if (email.indexOf('@') < 0) return '';
    const domain = email.trim().split('@')[1].toLowerCase();
    if (!domain) return '';

    const {data, error} = await supabase.from('school')
    .select('id').eq('domain', domain).single();

    if (error) {
        console.log('Error fetching school with domain', domain, error);
        return '';
    }
    console.log(data.id);
    return data.id || '';
}