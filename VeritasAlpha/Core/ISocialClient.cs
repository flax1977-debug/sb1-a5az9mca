using System.Threading.Tasks;

namespace VeritasAlpha.Core
{
    public interface ISocialClient
    {
        Task<SocialSummary?> GetRedditSummaryAsync(string ticker);
    }
}