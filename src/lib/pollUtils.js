// Poll utility functions
export const createPoll = (question, options) => {
    return {
        question,
        options: options.map(opt => ({
            text: opt,
            votes: []
        })),
        createdAt: new Date(),
        totalVotes: 0,
        allowMultiple: false
    };
};

export const votePoll = (poll, optionIndex, userId) => {
    // Remove previous vote if exists
    poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(id => id !== userId);
    });

    // Add new vote
    if (!poll.options[optionIndex].votes.includes(userId)) {
        poll.options[optionIndex].votes.push(userId);
    }

    // Update total
    poll.totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

    return poll;
};

export const getPollResults = (poll) => {
    return poll.options.map(opt => ({
        text: opt.text,
        votes: opt.votes.length,
        percentage: poll.totalVotes > 0 ? (opt.votes.length / poll.totalVotes * 100).toFixed(1) : 0
    }));
};
