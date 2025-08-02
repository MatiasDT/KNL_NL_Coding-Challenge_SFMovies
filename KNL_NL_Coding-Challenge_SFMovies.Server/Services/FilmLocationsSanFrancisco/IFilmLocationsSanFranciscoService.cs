namespace KNL_NL_Coding_Challenge_SFMovies.Server;

public interface IFilmLocationsSanFranciscoService
{
    Task<IEnumerable<FilmingLocation>> GetFilmLocationsAsync();
}
