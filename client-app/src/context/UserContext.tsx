import { createContext, useContext } from 'react';

export type UserState = {
	isLoggedIn: boolean;
	regionId: number;
};

export const UserContext = createContext<UserState>({
	isLoggedIn: true,
	regionId: 1,
});

export function useUser() {
	return useContext(UserContext);
}
