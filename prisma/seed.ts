// prisma/seed.ts
import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, TicketPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminExists = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!adminExists) {
    const passwordHash: string = await bcrypt.hash('admin123', 10);

    await prisma.user.create({
      data: {
        email: 'admin@servicedesk.com',
        name: 'Administrador',
        passwordHash,
        role: Role.ADMIN,
      },
    });

    console.log('Admin padrão criado: admin@servicedesk.com / admin123');
  }

  // Seed de categorias padrão
  const defaultCategories = [
    {
      name: 'Suporte Técnico',
      description: 'Problemas técnicos e de infraestrutura',
    },
    { name: 'Dúvidas', description: 'Dúvidas gerais sobre o sistema' },
    {
      name: 'Solicitação',
      description: 'Solicitações de novos recursos ou acessos',
    },
    {
      name: 'Bug Report',
      description: 'Relato de erros e comportamentos inesperados',
    },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('Categorias padrão criadas');

  // Seed de SLA configs padrão (globais, sem categoria)
  const defaultSlaConfigs = [
    {
      priority: TicketPriority.CRITICAL,
      responseTimeMin: 30,
      resolutionTimeMin: 240,
    },
    {
      priority: TicketPriority.HIGH,
      responseTimeMin: 60,
      resolutionTimeMin: 480,
    },
    {
      priority: TicketPriority.MEDIUM,
      responseTimeMin: 240,
      resolutionTimeMin: 1440,
    },
    {
      priority: TicketPriority.LOW,
      responseTimeMin: 480,
      resolutionTimeMin: 2880,
    },
  ];

  for (const sla of defaultSlaConfigs) {
    const existing = await prisma.slaConfig.findFirst({
      where: {
        priority: sla.priority,
        categoryId: null,
      },
    });

    if (!existing) {
      await prisma.slaConfig.create({
        data: {
          priority: sla.priority,
          responseTimeMin: sla.responseTimeMin,
          resolutionTimeMin: sla.resolutionTimeMin,
          businessHoursOnly: true,
        },
      });
    }
  }

  console.log('SLA configs padrão criadas');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
