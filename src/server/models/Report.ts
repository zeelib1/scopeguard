import { query } from '../../database/db';
import { Report as ReportType } from '../../types';

interface CreateReportParams {
  project_id: number;
  report_type: 'weekly' | 'monthly' | 'custom';
  data: any;
}

class Report {
  // Create report
  static create({ project_id, report_type, data }: CreateReportParams): ReportType | undefined {
    const dataJson = JSON.stringify(data);
    
    const result = query.run(
      `INSERT INTO reports (project_id, report_type, data, generated_at)
       VALUES (?, ?, ?, ?)`,
      [project_id, report_type, dataJson, Math.floor(Date.now() / 1000)]
    );

    return this.findById(Number(result.lastInsertRowid));
  }

  // Find by ID
  static findById(id: number) {
    const report = query.get<ReportType>(`SELECT * FROM reports WHERE id = ?`, [id]);
    
    if (report && report.data) {
      try {
        (report as any).data = JSON.parse(report.data);
      } catch (e) {
        // Leave as string
      }
    }
    
    return report;
  }

  // Find all for project
  static findByProjectId(projectId: number, report_type?: string) {
    let sql = `SELECT * FROM reports WHERE project_id = ?`;
    const params: any[] = [projectId];
    
    if (report_type) {
      sql += ` AND report_type = ?`;
      params.push(report_type);
    }
    
    sql += ` ORDER BY generated_at DESC`;
    
    const reports = query.all(sql, params);
    
    return reports.map((report: any) => {
      if (report.data) {
        try {
          report.data = JSON.parse(report.data);
        } catch (e) {
          // Leave as string
        }
      }
      return report;
    });
  }

  // Delete report
  static delete(id: number) {
    return query.run(`DELETE FROM reports WHERE id = ?`, [id]);
  }
}

export default Report;
