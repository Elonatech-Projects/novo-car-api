export type UpdatedJobPayload = {
  status?: 'pending' | 'reviewed' | 'rejected' | 'accepted';
  coverLetter?: string;
  cvUrl?: string;
  cvFileName?: string;
};
