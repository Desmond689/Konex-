// src/api/services/report.service.ts
import { ErrorCode, ErrorSeverity, KonexError } from '../../core/errors/app.error';
import { logger } from '../../core/logger/logger.service';
import { supabase } from '../client/supabase.client';

export interface IReportService {
  createReport(data: any): Promise<any>;
  getReport(reportId: string): Promise<any>;
  getReportsByUser(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getReportsByStatus(status: string, limit?: number, offset?: number): Promise<any[]>;
  updateReportStatus(reportId: string, status: string, moderatorId?: string): Promise<void>;
  getReportTypes(): string[];
}

class ReportService implements IReportService {
  private reportTypes = [
    'Harassment',
    'Spam',
    'Offensive Content',
    'NSFW',
    'Violence',
    'Impersonation',
    'Self-Harm',
    'Cheating/Hacks',
    'Copyright',
    'Scam/Fraud',
    'Other',
  ];

  async createReport(data: any): Promise<any> {
    try {
      logger.info('🚩 Creating report', { reporterId: data.reporter_id });

      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          ...data,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('✅ Report created', { reportId: report.id });
      return report;
    } catch (error) {
      logger.error('❌ Create report error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Report creation failed',
        'Failed to create report. Please try again.',
        ErrorSeverity.ERROR,
        { error }
      );
    }
  }

  async getReport(reportId: string): Promise<any> {
    try {
      logger.info('🚩 Fetching report', { reportId });

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:users!reporter_id (
            id,
            gamer_tag,
            username,
            avatar_url
          ),
          reported_user:users!reported_user_id (
            id,
            gamer_tag,
            username,
            avatar_url,
            bio
          ),
          reported_post:posts!reported_post_id (
            id,
            content,
            post_type,
            media_urls
          ),
          reported_comment:comments!reported_comment_id (
            id,
            content
          ),
          reported_squad:squads!reported_squad_id (
            id,
            name,
            icon_url,
            description
          ),
          moderator:users!moderator_id (
            id,
            gamer_tag,
            username
          )
        `)
        .eq('id', reportId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('❌ Get report error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Report fetch failed',
        'Failed to fetch report. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getReportsByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🚩 Fetching reports by user', { userId });

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reported_user:users!reported_user_id (
            id,
            gamer_tag,
            username
          ),
          moderator:users!moderator_id (
            id,
            gamer_tag,
            username
          )
        `)
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get reports by user error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Reports fetch failed',
        'Failed to fetch reports. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async getReportsByStatus(
    status: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      logger.info('🚩 Fetching reports by status', { status });

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:users!reporter_id (
            id,
            gamer_tag,
            username,
            avatar_url
          ),
          reported_user:users!reported_user_id (
            id,
            gamer_tag,
            username
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Get reports by status error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Reports fetch failed',
        'Failed to fetch reports. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  async updateReportStatus(
    reportId: string,
    status: string,
    moderatorId?: string
  ): Promise<void> {
    try {
      logger.info('🚩 Updating report status', { reportId, status, moderatorId });

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (moderatorId) {
        updateData.moderator_id = moderatorId;
      }

      if (status === 'resolved' || status === 'dismissed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) {
        throw error;
      }

      logger.info('✅ Report status updated', { reportId, status });
    } catch (error) {
      logger.error('❌ Update report status error', { error });
      throw new KonexError(
        ErrorCode.DB_QUERY_ERROR,
        'Status update failed',
        'Failed to update report status. Please try again.',
        ErrorSeverity.WARNING,
        { error }
      );
    }
  }

  getReportTypes(): string[] {
    return this.reportTypes;
  }
}

export const reportService = new ReportService();
export default reportService;