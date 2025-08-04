using Microsoft.AspNetCore.Mvc;

namespace KNL_NL_Coding_Challenge_SFMovies.Server;

[ApiController]
[Route("api/[controller]")]
public class FilmLocationsSanFranciscoController : ControllerBase
{
    private readonly IFilmLocationsSanFranciscoService _filmLocationsService;

    public FilmLocationsSanFranciscoController(IFilmLocationsSanFranciscoService filmLocationsService)
    {
        _filmLocationsService = filmLocationsService;
    }

    [HttpGet(Name = "GetFilmLocationsSanFrancisco")]
    public async Task<IEnumerable<FilmingLocation>> Get()
    {
        return await _filmLocationsService.GetFilmLocationsAsync();
    }
}
