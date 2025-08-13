'use client';

import { Term } from '@/types/term';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, Bot, ExternalLink, Tag, Link } from 'lucide-react';

interface TermCardProps {
  term: Term;
  relatedTerms: Term[];
}

// Learning resource links for each term - implementation ready for future use
const learningLinks: Record<string, { title: string; url: string; type: string }[]> = {
  // Links removed for now but structure preserved for future implementation
};

export function TermCard({ term, relatedTerms }: TermCardProps) {
  const [showExample, setShowExample] = useState(false);
  const [showAiTip, setShowAiTip] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  
  const difficultyLabel = {
    '🌱': 'Začátečník',
    '🚀': 'Pokročilý'
  }[term.difficulty] || term.difficulty;
  const links = learningLinks[term.id] || [];

  return (
    <Card className="transition-all hover:shadow-md border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-black leading-tight">
              {term.term}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{term.czechName}</p>
          </div>
          <div className="flex gap-2 items-center flex-shrink-0">
            <Badge variant="outline" className="text-xs">
              {term.category}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {difficultyLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed">
          {term.description}
        </p>
        
        {/* Collapsible Sections */}
        <div className="space-y-1">
          {/* Practical Example */}
          <div>
            <Button
              onClick={() => setShowExample(!showExample)}
              variant="ghost"
              size="sm"
              className="w-full justify-start px-0 h-8 text-sm hover:bg-transparent"
            >
              {showExample ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
              <Lightbulb className="w-4 h-4 mr-2" />
              Praktický příklad
            </Button>
            
            {showExample && (
              <div className="ml-6 mt-2 p-3 bg-gray-50 border rounded text-sm">
                {term.practicalExample}
              </div>
            )}
          </div>
          
          {/* AI Tip */}
          {term.aiTip && (
            <div>
              <Button
                onClick={() => setShowAiTip(!showAiTip)}
                variant="ghost"
                size="sm"
                className="w-full justify-start px-0 h-8 text-sm hover:bg-transparent"
              >
                {showAiTip ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                <Bot className="w-4 h-4 mr-2" />
                AI Tip
              </Button>
              
              {showAiTip && (
                <div className="ml-6 mt-2 p-3 bg-gray-50 border rounded text-sm">
                  {term.aiTip}
                </div>
              )}
            </div>
          )}
          
          {/* Learning Links */}
          {links.length > 0 && (
            <div>
              <Button
                onClick={() => setShowLinks(!showLinks)}
                variant="ghost"
                size="sm"
                className="w-full justify-start px-0 h-8 text-sm hover:bg-transparent"
              >
                {showLinks ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                <ExternalLink className="w-4 h-4 mr-2" />
                Kde se dozvědět více
              </Button>
              
              {showLinks && (
                <div className="ml-6 mt-2 space-y-1">
                  {links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 hover:bg-gray-50 border rounded text-sm transition-colors group"
                    >
                      <span className="font-medium">{link.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {link.type}
                        </Badge>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Tags */}
          {term.tags && term.tags.length > 0 && (
            <div>
              <Button
                onClick={() => setShowTags(!showTags)}
                variant="ghost"
                size="sm"
                className="w-full justify-start px-0 h-8 text-sm hover:bg-transparent"
              >
                {showTags ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                <Tag className="w-4 h-4 mr-2" />
                Tagy
              </Button>
              
              {showTags && (
                <div className="ml-6 mt-2 flex flex-wrap gap-1">
                  {term.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Related Terms */}
          {relatedTerms.length > 0 && (
            <div>
              <Button
                onClick={() => setShowRelated(!showRelated)}
                variant="ghost"
                size="sm"
                className="w-full justify-start px-0 h-8 text-sm hover:bg-transparent"
              >
                {showRelated ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                <Link className="w-4 h-4 mr-2" />
                Související termíny
              </Button>
              
              {showRelated && (
                <div className="ml-6 mt-2 flex flex-wrap gap-1">
                  {relatedTerms.map((relatedTerm) => (
                    <Badge key={relatedTerm.id} variant="outline" className="text-xs">
                      {relatedTerm.term}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}