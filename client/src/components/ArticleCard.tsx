import { ExternalLink, Clock } from "lucide-react";
import type { SnapshotArticle } from "@/types/snapshot";

interface ArticleCardProps {
  article: SnapshotArticle;
  showCountry?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ArticleCard = ({ article, showCountry = true }: ArticleCardProps) => {
  return (
    <article className="card-article group animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-sm">
          {showCountry && (
            <>
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                {article.country}
              </span>
              <span className="text-muted-foreground">•</span>
            </>
          )}
          <span className="text-muted-foreground">{article.source}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatTime(article.publishedAt)}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
        {article.headline}
      </h3>

      <p className="text-body mb-4 line-clamp-2">{article.summary}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Read original
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};

export default ArticleCard;
