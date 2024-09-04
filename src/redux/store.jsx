import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './searchSlice';
import promiseMiddleware from 'redux-promise';

// Create a store with the Redux Promise middleware
const store = configureStore({
  reducer: {
    search: searchReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(promiseMiddleware),
  devTools: 'production' // Enable DevTools only in development
});

export default store;
