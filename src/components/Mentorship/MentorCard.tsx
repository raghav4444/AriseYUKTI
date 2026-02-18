import React from 'react';
import { Star, Shield, MessageCircle } from 'lucide-react';
import { Mentor } from '../../types';

interface MentorCardProps {
  mentor: Mentor;
  onRequestMentorship: (mentorId: string) => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onRequestMentorship }) => {
  return (
    <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {mentor.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
            {mentor.isVerified && (
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                mentor.isActive && mentor.isAvailable
                  ? 'bg-green-500/20 text-green-400'
                  : !mentor.isAvailable
                    ? 'bg-amber-500/20 text-amber-400'
                    : mentor.isActive
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-600/30 text-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  mentor.isActive && mentor.isAvailable 
                    ? 'bg-green-400' 
                    : !mentor.isAvailable 
                      ? 'bg-amber-400' 
                      : mentor.isActive
                        ? 'bg-blue-400'
                        : 'bg-gray-500'
                }`}
              />
              {mentor.isActive && mentor.isAvailable
                ? 'Available Now'
                : !mentor.isAvailable
                  ? 'Busy'
                  : mentor.isActive
                    ? 'Online'
                    : 'Away'}
            </span>
          </div>
          
          <div className="space-y-1 mb-3">
            <p className="text-sm text-gray-400">{mentor.college}</p>
            <p className="text-sm text-gray-400">{mentor.branch} • {mentor.year}th Year</p>
            {mentor.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-300">{mentor.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{mentor.bio}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {mentor.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
            {mentor.skills.length > 3 && (
              <span className="text-xs text-gray-400">
                +{mentor.skills.length - 3} more
              </span>
            )}
          </div>

          <button
            onClick={() => onRequestMentorship(mentor.id)}
            disabled={!(mentor.isActive && mentor.isAvailable)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Request Mentorship</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorCard;