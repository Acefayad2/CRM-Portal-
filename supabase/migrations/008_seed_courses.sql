-- Seed courses from Resources page training modules (Licensing, CFT, Appointment)
-- Uses fixed UUIDs for deterministic seed.

-- Course 1: Licensing Module
insert into courses (id, title, description, category, level, is_published, updated_at)
values (
  'a1000001-0001-4000-8000-000000000001',
  'Licensing Module',
  'Complete guide to obtaining and maintaining your insurance license. Learn about state requirements, exam preparation, continuing education, and license renewal processes.',
  'licensing',
  'beginner',
  true,
  now()
) on conflict (id) do nothing;

insert into modules (id, course_id, title, description, sort_order, updated_at)
values (
  'b1000001-0001-4000-8000-000000000001',
  'a1000001-0001-4000-8000-000000000001',
  'Course content',
  null,
  0,
  now()
) on conflict (id) do nothing;

insert into lessons (id, module_id, title, description, sort_order, duration_seconds, updated_at) values
  ('c1000001-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000001', 'Introduction to Insurance Licensing', 'Overview of insurance licensing requirements and the importance of proper certification.', 0, 1800, now()),
  ('c1000001-0001-4000-8000-000000000002', 'b1000001-0001-4000-8000-000000000001', 'State-Specific Requirements', 'Understanding the unique licensing requirements for different states.', 1, 2700, now()),
  ('c1000001-0001-4000-8000-000000000003', 'b1000001-0001-4000-8000-000000000001', 'Exam Preparation Strategies', 'Tips and strategies for passing your insurance licensing exam on the first try.', 2, 3600, now()),
  ('c1000001-0001-4000-8000-000000000004', 'b1000001-0001-4000-8000-000000000001', 'Continuing Education Requirements', 'Understanding CE requirements and how to maintain your license.', 3, 2400, now()),
  ('c1000001-0001-4000-8000-000000000005', 'b1000001-0001-4000-8000-000000000001', 'License Renewal Process', 'Step-by-step guide to renewing your insurance license.', 4, 1800, now()),
  ('c1000001-0001-4000-8000-000000000006', 'b1000001-0001-4000-8000-000000000001', 'Licensing Module Assessment', 'Test your knowledge with a comprehensive quiz covering all licensing topics.', 5, 2700, now())
on conflict (id) do nothing;

-- Course 2: CFT Training
insert into courses (id, title, description, category, level, is_published, updated_at)
values (
  'a1000001-0001-4000-8000-000000000002',
  'CFT Training',
  'Comprehensive training on Client Financial Tools (CFT). Master financial planning software, client analysis tools, and how to effectively present financial solutions to clients.',
  'cft',
  'beginner',
  true,
  now()
) on conflict (id) do nothing;

insert into modules (id, course_id, title, description, sort_order, updated_at)
values (
  'b1000001-0001-4000-8000-000000000002',
  'a1000001-0001-4000-8000-000000000002',
  'Course content',
  null,
  0,
  now()
) on conflict (id) do nothing;

insert into lessons (id, module_id, title, description, sort_order, duration_seconds, updated_at) values
  ('c1000001-0001-4000-8000-000000000007', 'b1000001-0001-4000-8000-000000000002', 'CFT Platform Overview', 'Introduction to the Client Financial Tools platform and its key features.', 0, 2700, now()),
  ('c1000001-0001-4000-8000-000000000008', 'b1000001-0001-4000-8000-000000000002', 'Client Data Entry and Management', 'Learn how to accurately enter and manage client financial information.', 1, 3600, now()),
  ('c1000001-0001-4000-8000-000000000009', 'b1000001-0001-4000-8000-000000000002', 'Financial Analysis Tools', 'Understanding and using CFT''s financial analysis capabilities.', 2, 5400, now()),
  ('c1000001-0001-4000-8000-00000000000a', 'b1000001-0001-4000-8000-000000000002', 'Generating Client Reports', 'Create professional, comprehensive reports for your clients.', 3, 3000, now()),
  ('c1000001-0001-4000-8000-00000000000b', 'b1000001-0001-4000-8000-000000000002', 'Presenting Solutions to Clients', 'Effective strategies for presenting financial solutions using CFT data.', 4, 4500, now()),
  ('c1000001-0001-4000-8000-00000000000c', 'b1000001-0001-4000-8000-000000000002', 'Advanced CFT Features', 'Explore advanced features and shortcuts to maximize your efficiency.', 5, 3600, now()),
  ('c1000001-0001-4000-8000-00000000000d', 'b1000001-0001-4000-8000-000000000002', 'CFT Training Assessment', 'Test your CFT knowledge and skills with a comprehensive assessment.', 6, 3600, now())
on conflict (id) do nothing;

-- Course 3: Appointment Training
insert into courses (id, title, description, category, level, is_published, updated_at)
values (
  'a1000001-0001-4000-8000-000000000003',
  'Appointment Training',
  'Master the art of scheduling, conducting, and following up on client appointments. Learn proven techniques for appointment setting, preparation, execution, and follow-up.',
  'appointment',
  'beginner',
  true,
  now()
) on conflict (id) do nothing;

insert into modules (id, course_id, title, description, sort_order, updated_at)
values (
  'b1000001-0001-4000-8000-000000000003',
  'a1000001-0001-4000-8000-000000000003',
  'Course content',
  null,
  0,
  now()
) on conflict (id) do nothing;

insert into lessons (id, module_id, title, description, sort_order, duration_seconds, updated_at) values
  ('c1000001-0001-4000-8000-00000000000e', 'b1000001-0001-4000-8000-000000000003', 'The Art of Appointment Setting', 'Learn proven techniques for getting clients to agree to appointments.', 0, 3600, now()),
  ('c1000001-0001-4000-8000-00000000000f', 'b1000001-0001-4000-8000-000000000003', 'Pre-Appointment Preparation', 'How to prepare effectively before meeting with a client.', 1, 2700, now()),
  ('c1000001-0001-4000-8000-000000000010', 'b1000001-0001-4000-8000-000000000003', 'Conducting Effective Appointments', 'Best practices for running successful client appointments.', 2, 5400, now()),
  ('c1000001-0001-4000-8000-000000000011', 'b1000001-0001-4000-8000-000000000003', 'Using Technology in Appointments', 'Leverage digital tools to enhance your appointment experience.', 3, 2400, now()),
  ('c1000001-0001-4000-8000-000000000012', 'b1000001-0001-4000-8000-000000000003', 'Post-Appointment Follow-Up', 'Critical follow-up strategies to convert appointments into clients.', 4, 3000, now()),
  ('c1000001-0001-4000-8000-000000013', 'b1000001-0001-4000-8000-000000000003', 'Handling Difficult Appointments', 'Strategies for managing challenging client situations.', 5, 3300, now()),
  ('c1000001-0001-4000-8000-000000014', 'b1000001-0001-4000-8000-000000000003', 'Appointment Training Assessment', 'Test your appointment skills with a comprehensive assessment.', 6, 2700, now())
on conflict (id) do nothing;
