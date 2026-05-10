export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  photoURL?: string;
}

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedToId?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  message: string;
  userId: string;
  ticketId: string;
  createdAt: Date;
}
