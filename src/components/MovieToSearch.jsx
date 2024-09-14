import React, { useState, memo } from "react";

import { Close } from "@bigbinary/neeto-icons";
import { Input, Spinner } from "@bigbinary/neetoui";
import axios from "axios";

import MoviePreviewCard from "./Movies/MoviePreviewCard";

import useDebounce from "../hooks/useDebounce";
import { useMovie } from "../store/MovieStore";

const MovieToSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentMovie } = useMovie();
  const [movieList, setMovieList] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const fetchMovies = async searchQuery => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `https://www.omdbapi.com/?apikey=e4fc4dee&s=${searchQuery}`
      );

      if (response.data.Response === "False") {
        if (response.data.Error === "Incorrect IMDb ID.") {
          setError("Please type an exciting movie.");
        } else {
          setError(response.data.Error);
        }
      } else {
        setMovieList(response.data.Search);
      }
    } catch (e) {
      setError("Something went wrong.");
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Use the custom hook
  const debouncedFetchMovies = useDebounce(fetchMovies, 3000);

  const handleChange = e => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() !== "") {
      debouncedFetchMovies(value);
    } else {
      setMovieList(null);
      setError("");
    }
  };

  const handleClear = () => {
    setQuery("");
    setMovieList(null);
    setError("");
  };

  console.log(currentMovie);

  return (
    <div className="mt-8 flex h-screen w-full flex-col items-center bg-gradient-to-b text-white">
      <div className="relative mb-1 mt-5 w-full max-w-lg">
        <Input
          className="w-full rounded-lg p-4 pr-10 text-gray-800 shadow-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          placeholder="Search for movies..."
          value={query}
          onChange={handleChange}
        />
        {query && (
          <Close
            className="absolute right-4 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-800 hover:text-gray-600"
            size={24}
            onClick={handleClear}
          />
        )}
      </div>
      {isLoading ? (
        <Spinner className="mt-6" size="large" />
      ) : (
        <div className="no-scrollbar mt-6 flex h-full w-full max-w-6xl flex-wrap justify-center gap-8 overflow-y-auto">
          {error ? (
            <h2 className="text-red-500">{error}</h2>
          ) : (
            <>
              {movieList &&
                movieList.length > 0 &&
                movieList
                  .reverse()
                  .map(itm => <MoviePreviewCard info={itm} key={itm.imdbID} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(MovieToSearch);
