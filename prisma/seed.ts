import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ─── Admin user ───
  const adminPassword = await hash('Admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'مدیر سیستم',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // ─── Manager user ───
  const managerPassword = await hash('Manager123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@gmail.com' },
    update: {},
    create: {
      email: 'manager@gmail.com',
      name: 'مدیر پروژه',
      password: managerPassword,
      role: 'MANAGER',
    },
  });

  // ─── Member user ───
  const memberPassword = await hash('Member123', 12);
  const member = await prisma.user.upsert({
    where: { email: 'member@gmail.com' },
    update: {},
    create: {
      email: 'member@gmail.com',
      name: 'عضو تیم',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  // ─── Demo Project 1: Website Design ───
  await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      name: 'پروژه نمونه - طراحی وبسایت فروشگاهی',
      description:
        'این پروژه شامل طراحی، پیاده‌سازی و استقرار یک وبسایت فروشگاهی کامل است. از این پروژه برای نمایش قابلیت‌های سیستم استفاده می‌شود.',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: manager.id, role: 'MANAGER' },
          { userId: member.id, role: 'MEMBER' },
        ],
      },
      tasks: {
        create: [
          {
            title: 'تحلیل نیازمندی‌های مشتری',
            description: 'جلسه با مشتری برای جمع‌آوری نیازمندی‌ها و مستندسازی',
            status: 'DONE',
            priority: 'HIGH',
            creatorId: admin.id,
            assignees: { create: [{ userId: admin.id }, { userId: manager.id }] },
          },
          {
            title: 'طراحی UI/UX صفحه اصلی',
            description: 'طراحی رابط کاربری با Figma شامل نسخه موبایل و دسکتاپ',
            status: 'DONE',
            priority: 'HIGH',
            creatorId: manager.id,
            assignees: { create: [{ userId: manager.id }] },
          },
          {
            title: 'پیاده‌سازی سبد خرید',
            description: 'پیاده‌سازی سبد خرید با React Context و مدیریت state',
            status: 'IN_PROGRESS',
            priority: 'URGENT',
            creatorId: manager.id,
            assignees: { create: [{ userId: admin.id }, { userId: member.id }] },
          },
          {
            title: 'راه‌اندازی درگاه پرداخت',
            description: 'اتصال به درگاه پرداخت زرین‌پال و تست تراکنش‌ها',
            status: 'IN_PROGRESS',
            priority: 'URGENT',
            creatorId: admin.id,
            assignees: { create: [{ userId: admin.id }] },
          },
          {
            title: 'نوشتن تست‌های واحد',
            description: 'پوشش تست برای کامپوننت‌ها و API routes',
            status: 'TODO',
            priority: 'MEDIUM',
            creatorId: manager.id,
            assignees: { create: [{ userId: member.id }] },
          },
          {
            title: 'بهینه‌سازی سئو',
            description: 'بهبود meta tags، سرعت بارگذاری و structure data',
            status: 'REVIEW',
            priority: 'MEDIUM',
            creatorId: member.id,
            assignees: { create: [{ userId: member.id }] },
          },
          {
            title: 'استقرار روی سرور',
            description: 'دیپلوی روی VPS با Docker و تنظیم SSL',
            status: 'TODO',
            priority: 'LOW',
            creatorId: admin.id,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            assignees: { create: [{ userId: admin.id }] },
          },
          {
            title: 'آموزش کارمند فروشگاه',
            description: 'تهیه مستندات آموزشی و برگزاری جلسه آنلاین',
            status: 'TODO',
            priority: 'LOW',
            creatorId: manager.id,
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            assignees: { create: [{ userId: manager.id }, { userId: member.id }] },
          },
        ],
      },
      chatRooms: {
        create: {
          name: 'چت تیم طراحی',
          type: 'GROUP',
          members: {
            create: [{ userId: admin.id }, { userId: manager.id }, { userId: member.id }],
          },
        },
      },
    },
  });

  // ─── Demo Project 2: Mobile App ───
  await prisma.project.upsert({
    where: { id: 'demo-project-2' },
    update: {},
    create: {
      id: 'demo-project-2',
      name: 'اپلیکیشن موبایل - باشگاه مشتریان',
      description:
        'طراحی و توسعه اپلیکیشن اندروید و iOS برای برنامه وفاداری مشتریان. شامل سیستم امتیازدهی، تخفیف‌ها، و اعلان‌های پوش‌نوتیفیکیشن.',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: manager.id, role: 'MANAGER' },
        ],
      },
      tasks: {
        create: [
          {
            title: 'تحقیقات بازار و رقبا',
            description: 'بررسی اپلیکیشن‌های مشابه در بازار ایران و جهان',
            status: 'DONE',
            priority: 'HIGH',
            creatorId: admin.id,
            assignees: { create: [{ userId: admin.id }] },
          },
          {
            title: 'طراحی معماری سیستم امتیازدهی',
            description: 'طراحی الگوریتم محاسبه امتیاز و سطوح مختلف کاربران',
            status: 'DONE',
            priority: 'HIGH',
            creatorId: manager.id,
            assignees: { create: [{ userId: manager.id }] },
          },
          {
            title: 'طراحی رابط کاربری اپلیکیشن',
            description: 'طراحی اسکرین‌های اصلی اپ با Figma - نسخه Android و iOS',
            status: 'IN_PROGRESS',
            priority: 'URGENT',
            creatorId: manager.id,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            assignees: { create: [{ userId: manager.id }] },
          },
          {
            title: 'پیاده‌سازی API سمت سرور',
            description: 'REST API با Node.js و PostgreSQL برای backend اپ',
            status: 'IN_PROGRESS',
            priority: 'URGENT',
            creatorId: admin.id,
            assignees: { create: [{ userId: admin.id }] },
          },
          {
            title: 'یکپارچه‌سازی پوش‌نوتیفیکیشن',
            description: 'راه‌اندازی Firebase Cloud Messaging برای اندروید و APNs برای iOS',
            status: 'TODO',
            priority: 'HIGH',
            creatorId: admin.id,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            assignees: { create: [{ userId: admin.id }] },
          },
          {
            title: 'تست امنیتی اپلیکیشن',
            description: 'بررسی آسیب‌پذیری‌های امنیتی و تست نفوذ',
            status: 'REVIEW',
            priority: 'MEDIUM',
            creatorId: manager.id,
            assignees: { create: [{ userId: manager.id }] },
          },
          {
            title: 'انتشار نسخه بتا در بازار',
            description: 'آماده‌سازی و انتشار نسخه آزمایشی در مارکت‌های اندروید',
            status: 'TODO',
            priority: 'LOW',
            creatorId: admin.id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            assignees: { create: [{ userId: admin.id }] },
          },
        ],
      },
      chatRooms: {
        create: {
          name: 'چت تیم اپلیکیشن',
          type: 'GROUP',
          members: {
            create: [{ userId: admin.id }, { userId: manager.id }],
          },
        },
      },
    },
  });

  console.log('\n✅ Seed data created successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('   Admin:   admin@gmail.com   / Admin123   (مدیر سیستم)');
  console.log('   Manager: manager@gmail.com / Manager123 (مدیر پروژه)');
  console.log('   Member:  member@gmail.com  / Member123  (عضو تیم)');
  console.log('\n📊 Demo Projects:');
  console.log('   1. طراحی وبسایت فروشگاهی (8 tasks, 3 members)');
  console.log('   2. اپلیکیشن موبایل - باشگاه مشتریان (7 tasks, 2 members)');
  console.log('\n🔗 Login: http://localhost:3000/login');
  console.log('   Click "ورود دمو" for instant access as Admin\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
