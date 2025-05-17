import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  AsciiCard,
  AsciiCardHeader,
  AsciiCardTitle,
  AsciiCardDescription,
  AsciiCardContent,
  AsciiCardFooter,
} from "~/components/ui/ascii-card";

export default function AsciiTable({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell className="max-w-[320px] max-h-[320px] overflow-scroll">
            <AsciiCard>
              <AsciiCardHeader>
                <AsciiCardTitle>Prompt Name</AsciiCardTitle>
                <AsciiCardDescription>Prompt Description</AsciiCardDescription>
              </AsciiCardHeader>
              <AsciiCardContent>
                <p>
                  Prompt Content Lorem Ipsum is simply dummy text of the Prompt
                  Content Lorem Ipsum is simply dummy text of the Prompt Content
                  Lorem Ipsum is simply dummy text of the Prompt Content Lorem
                  Ipsum is simply dummy text of the Prompt Content Lorem Ipsum
                  is simply dummy text of the Prompt Content Lorem Ipsum is
                  simply dummy text of the Prompt Content Lorem Ipsum is simply
                  dummy text of the Prompt Content Lorem Ipsum is simply dummy
                  text of the Prompt Content Lorem Ipsum is simply dummy text of
                  the Prompt Content Lorem Ipsum is simply dummy text of the
                </p>
              </AsciiCardContent>
              <AsciiCardFooter>
                <p>Created at</p>
              </AsciiCardFooter>
            </AsciiCard>
          </TableCell>
          <TableCell>
            <AsciiCard>
              <AsciiCardHeader>
                <AsciiCardTitle>Prompt Version</AsciiCardTitle>
                <AsciiCardDescription>
                  Prompt Version Description
                </AsciiCardDescription>
              </AsciiCardHeader>
              <AsciiCardContent>
                <p>Prompt Version Content</p>
              </AsciiCardContent>
              <AsciiCardFooter>
                <p>Updated at</p>
              </AsciiCardFooter>
            </AsciiCard>
          </TableCell>
          <TableCell>
            <AsciiCard>
              <AsciiCardHeader>
                <AsciiCardTitle>Prompt Tags</AsciiCardTitle>
                <AsciiCardDescription>
                  Prompt Tags Description
                </AsciiCardDescription>
              </AsciiCardHeader>
              <AsciiCardContent>
                <p>Prompt Tags Content</p>
              </AsciiCardContent>
              <AsciiCardFooter>
                <p>Updated at</p>
              </AsciiCardFooter>
            </AsciiCard>
          </TableCell>
          <TableCell>
            <AsciiCard>
              <AsciiCardHeader>
                <AsciiCardTitle>Prompt Type</AsciiCardTitle>
                <AsciiCardDescription>
                  Prompt Type Description
                </AsciiCardDescription>
              </AsciiCardHeader>
              <AsciiCardContent>
                <p className="text-right">Prompt Type Content</p>
              </AsciiCardContent>
              <AsciiCardFooter>
                <p>Updated at</p>
              </AsciiCardFooter>
            </AsciiCard>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
