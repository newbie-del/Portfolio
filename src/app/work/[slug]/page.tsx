import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS, getProject, getProjectNeighbours } from "@/data/projects";
import { ProjectDetail } from "@/components/work/ProjectDetail";

/**
 * 03_WORK / <slug> — TEARDOWN
 * ---------------------------------------------------------------------------
 * One template for all seven projects. Everything renders from projects.ts,
 * so a project is added or corrected in the data file and nowhere else.
 *
 * This shell stays a server component: it owns the static params, the per
 * project metadata and the 404, then hands the record to a client component
 * for the interactive layers.
 */
export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "PROJECT NOT FOUND" };

  return {
    title: `${project.name} — ${project.tagline}`,
    description: project.problem,
    openGraph: {
      title: `${project.name} — ${project.tagline}`,
      description: project.problem,
      images: [{ url: project.thumbnail }],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { prev, next } = getProjectNeighbours(slug);

  return <ProjectDetail project={project} prev={prev} next={next} />;
}
