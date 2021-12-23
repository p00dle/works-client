import * as React from 'react';
import { Button } from '~/components/_common/Button';
import { useConfirmModal } from '~/components/_common/ConfirmModal';
import { useErrorModal } from '~/components/_common/ErrorModal';
import { FileUpload } from '~/components/_common/FileUpload';
import { Form, Input } from '~/components/_common/Form';
import { Section, useSectionState } from '~/components/_common/Section';
import { Table, TableColumns } from '~/components/_common/Table';
import { format } from '~/lib/format';

const SectionWithControls: React.FC = function SectionWithControls() {
  const [state, setters] = useSectionState('SectionWithControls', {select: 'Type A', multiSelect: ['Red', 'Blue', 'Green'], date: null });
  return (
    <Section state={state} setters={setters} title="SECTION CONTROLS (PERSIST SELECTION)" controls={{
      select: { type: 'select', pool: ['Type A', 'Type B', 'Type C']},
      multiSelect: {type: 'multi-select', pool: ['Red', 'Blue', 'Green', 'Orange', 'Yellow', 'Pink']},
      date: {type: 'date', icon: 'calendar'}
    }} >
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </Section>
  );
}

const TableSection: React.FC = function TableSection() {
  
  function randomNumber(from: number, to: number, integer = true): number {
    const delta = to - from;
    const rand = Math.random();
    const output = rand * delta + from;
    return integer ? Math.round(output) : output;
  }

  function randomFromArray<T>(arr: T[]): T {
      return arr[Math.round(Math.random() * (arr.length - 1))];
  }

  const data = new Array(135).fill(0).map(() => ({
    name: randomFromArray(['Bob', 'John', 'Jane', 'Kate', 'Tuppence']),
    count: randomNumber(10, 500),
    ratio: randomNumber(0, 1, false),
    date: Date.now() - (randomNumber(0, 5) * 1000 * 60 * 60 * 24),
  }))
  const columns: TableColumns<typeof data[number]> = [
    { prop: 'name', header: 'NAME', filter: 'search', width: 120 },
    { prop: 'count', header: 'COUNT', sort: true, },
    { prop: 'ratio', header: 'RATIO', format: format.number.asPerc },
    { prop: 'date', header: 'DATE', filter: 'date', format: format.number.asDate }
  ];

  return <Section className="p-4" title="TABLE" exportData={{data}}><Table data={data} columns={columns} /></Section>
}

export const Home: React.FC = function Home() {
  const showError = useErrorModal('Sample error message');
  const showConfirm = useConfirmModal('When clicked the listener in next argument will fire', () => console.log('Confirmed'));

  return (
    <div className="grid grid-cols-3 gap-12 p-8">

      <div className="col-span-3">
        <TableSection />
      </div>

      <div className="col-span-3">
        <SectionWithControls />
      </div>

      <Section title="BUTTONS" className="p-4 space-x-4">
        <Button text="BASE" />
        <Button className="btn-primary" text="PRIMARY" />
      </Section>
      
      <Section title="FORM" className="p-4">
        <Form onSubmit={vals => console.log(`Form submitted. JSON values: \n${JSON.stringify(vals, null ,2)}`)} >
          <Input type="boolean" prop="active" hint="Set to active if user is active" />
          <Input type="date" prop="startDate"  />
          <Input type="email" prop="email" label="Email" />
          <Input type="enum" values={['admin', 'non-admin']} prop="role" />
          <Input type="float" initialValue={0.3} prop="ratio" />
          <Input type="hidden" prop="someHiddenValue" initialValue="do not show" />
          <Input type="integer" initialValue={5} prop="count" />
          <Input type="password" prop="password" />
          <Input type="string" prop="username" />
          <Input type="text" prop="comment" />
          <Input type="submit" />
        </Form>
      </Section>

      <Section title="FILE UPLOAD" className="p-8">
        <FileUpload apiRoute="" title="File Upload Title" />
      </Section>

      <Section title="MODALS" className="p-4 space-x-4">
        <Button onClick={showError}>ERROR</Button>
        <Button onClick={showConfirm}>CONFIRM</Button>
      </Section>

    </div>
  );
}
