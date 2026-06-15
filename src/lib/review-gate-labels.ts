export type ReviewGateStatus =
	| 'none'
	| 'draft'
	| 'review'
	| 'pending_review'
	| 'review-ready'
	| 'accepted'
	| 'rejected'
	| 'failed'
	| 'failed_validation';

export function reviewGateStatusLabel(status: ReviewGateStatus): string {
	switch (status) {
		case 'review':
		case 'pending_review':
		case 'review-ready':
			return 'Pending review';
		case 'accepted':
			return 'Accepted';
		case 'rejected':
			return 'Rejected';
		case 'failed':
			return 'Failed';
		case 'failed_validation':
			return 'Failed validation';
		case 'draft':
			return 'Draft';
		case 'none':
			return 'No draft';
	}
}
