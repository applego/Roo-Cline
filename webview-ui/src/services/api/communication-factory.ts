import { WebviewMessage } from "../../../../src/shared/WebviewMessage"

export interface Communication {
	send: (message: WebviewMessage) => void
	onMessage?: (callback: (message: WebviewMessage) => void) => void
}

export class CommunicationFactory {
	private static instance: CommunicationFactory
	private communication: Communication | null = null

	private constructor() {}

	public static getInstance(): CommunicationFactory {
		if (!CommunicationFactory.instance) {
			CommunicationFactory.instance = new CommunicationFactory()
		}
		return CommunicationFactory.instance
	}

	public setCommunication(communication: Communication) {
		this.communication = communication
	}

	public getCommunication(): Communication | null {
		return this.communication
	}
}
