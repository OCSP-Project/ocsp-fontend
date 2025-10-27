export interface ProposalItemDto {
  name: string;
  price: number;
  notes?: string;
}

export interface ContractorSummaryDto {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface ProposalDto {
  id: string;
  quoteRequestId: string;
  contractorUserId: string;
  priceTotal: number;
  durationDays: number;
  termsSummary?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: ProposalItemDto[];
  contractor?: ContractorSummaryDto;
  quoteRequest?: {
    id: string;
    project?: {
      id: string;
      title: string;
      description: string;
    };
  };
  
  // Excel-based proposal info
  isFromExcel?: boolean;
  excelFileName?: string;
  excelFileUrl?: string;
  
  // Project Information from Excel
  projectTitle?: string;
  constructionArea?: string;
  constructionTime?: string;
  numberOfWorkers?: string;
  averageSalary?: string;
  
  // Resubmission tracking
  hasBeenSubmitted?: boolean;
}

export interface CreateProposalDto {
  quoteRequestId: string;
  priceTotal: number;
  durationDays: number;
  termsSummary?: string;
  items: ProposalItemDto[];
}

export interface UpdateProposalDto {
  durationDays: number;
  termsSummary?: string;
  items: ProposalItemDto[];
}
