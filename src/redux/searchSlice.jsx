
import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    inputValue: '',
    userLocation: { lat: -3.745, lng: -38.523 },
    suggestions: [],
    searchResults: [], // Store multiple search results
  },
  reducers: {
    setInputValue(state, action) {
      state.inputValue = action.payload;
    },
    setUserLocation(state, action) {
      state.userLocation = action.payload;
    },
    setSuggestions(state, action) {
      state.suggestions = action.payload;
    },
    clearInputValue(state) {
      state.inputValue = '';
    },
    addSearchResult(state, action) {
      state.searchResults.push(action.payload); // Append new result
    },
    clearSearchResults(state) {
      state.searchResults = []; // Clear all results
    },
  },
});

export const { setInputValue, setUserLocation, setSuggestions, clearInputValue, addSearchResult, clearSearchResults } = searchSlice.actions;

export default searchSlice.reducer;

