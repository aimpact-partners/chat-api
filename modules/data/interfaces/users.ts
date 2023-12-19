export /*bundle*/ interface IUsersBaseData {
	uid: string;
	id: string;
	name: string;
	displayName: string;
	email: string;
	photoURL: string;
	phoneNumber: number;
}
export /*bundle*/ interface IUsersData extends IUsersBaseData {
	firebaseToken: string;
	token: string;
	custom: string;
	createdOn: number;
	lastLogin: number;
}
