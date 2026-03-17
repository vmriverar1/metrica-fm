import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase/config';

export async function GET() {
  try {
    // Fetch departments
    const departmentsRef = collection(db, COLLECTIONS.CAREER_DEPARTMENTS);
    const departmentsSnapshot = await getDocs(departmentsRef);
    const departments = departmentsSnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    // Fetch active job postings
    const jobsRef = collection(db, COLLECTIONS.CAREER_POSITIONS);
    const jobsQuery = query(jobsRef, where('status', '==', 'active'));
    const jobsSnapshot = await getDocs(jobsQuery);

    const job_postings = jobsSnapshot.docs.map((jobDoc) => {
      const data = jobDoc.data();
      return {
        id: jobDoc.id,
        title: data.title || '',
        slug: data.slug || '',
        category: data.category || '',
        department: data.departmentId || '',
        location: data.location || {
          city: '',
          region: '',
          country: 'Perú',
          remote: false,
          hybrid: false,
          address: ''
        },
        type: data.type || 'full-time',
        level: data.level || 'mid',
        status: data.status || 'active',
        experience_years: data.experienceYears || 0,
        featured: data.featured || false,
        urgent: data.urgent || false,
        posted_date: data.postedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        deadline: data.deadline?.toDate?.()?.toISOString() || '',
        short_description: data.shortDescription || '',
        full_description: data.fullDescription || '',
        key_responsibilities: data.responsibilities || [],
        requirements: {
          essential: data.requirements?.essential || [],
          preferred: data.requirements?.preferred || []
        },
        salary: data.salary || undefined,
        benefits: data.benefits || [],
        application_process: data.applicationProcess || {
          steps: [],
          contact_email: '',
          required_documents: []
        }
      };
    });

    const responseData = {
      page_info: {
        title: 'Carreras - Métrica FM',
        description: 'Únete a nuestro equipo',
        hero: {
          title: 'Construye tu futuro con nosotros',
          subtitle: 'Descubre oportunidades profesionales en Métrica FM',
          background_image: '/images/careers-hero.jpg',
          cta_text: 'Ver oportunidades',
          stats: {
            total_positions: job_postings.length,
            departments: departments.length,
            average_growth: '25%',
            team_size: '150+'
          }
        }
      },
      departments: departments.map((dept: any) => ({
        id: dept.id,
        name: dept.name || '',
        slug: dept.slug || '',
        description: dept.description || '',
        detailed_description: dept.detailed_description || dept.description || '',
        icon: dept.icon || 'building-2',
        color: dept.color || '#003F6F',
        open_positions: job_postings.filter(j => j.department === dept.id).length,
        total_employees: dept.total_employees || 0,
        featured: dept.featured || false,
        required_skills: dept.required_skills || [],
        career_path: dept.career_path || {
          entry_level: '',
          mid_level: '',
          senior_level: '',
          leadership: ''
        },
        typical_projects: dept.typical_projects || [],
        positions: job_postings.filter(j => j.department === dept.id).map(j => j.title)
      })),
      job_postings
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('[API /api/careers/dynamic] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load careers data'
      },
      { status: 500 }
    );
  }
}
