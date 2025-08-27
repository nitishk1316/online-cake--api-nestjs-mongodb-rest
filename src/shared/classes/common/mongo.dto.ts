/**
 * Mongo Delete document
 */
export class DeleteResult {
	deletedCount?: number;
	//Is 1 if the command executed correctly.
	ok?: number;
	//The total count of documents deleted.
	n?: number;
}