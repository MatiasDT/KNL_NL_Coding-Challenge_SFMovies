namespace KNL_NL_Coding_Challenge_SFMovies.Server;

public class FilmingLocation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Title { get; set; }
    public string? ReleaseYear { get; set; }
    public string? Locations { get; set; }
    public double Longitude { get; set; }
    public double Latitude { get; set; }
}