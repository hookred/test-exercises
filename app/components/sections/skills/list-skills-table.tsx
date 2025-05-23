import { type Skill } from "@prisma/client";
import { Link } from "react-router";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "#app/components/ui/table";

interface Props {
  skills: Skill[]
}

export function ListSkillsTable({ skills }: Props) {
  return (
    <Table>
      <TableCaption>List of skills you will learn in this course.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skills.map((skill) => (
          <TableRow key={skill.id} className="w-full relative">
            <TableCell className="font-medium">
              <Link to={`/skills/${skill.id}`}>
                {skill.title}
                <span className="absolute inset-0"></span>
              </Link>
            </TableCell>
            <TableCell>{skill.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right font-mono">{skills.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}