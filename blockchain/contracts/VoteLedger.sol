// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract VoteLedger {
    struct Vote {
        string electionId;
        string candidateId;
        address voter;
    }

    mapping(string => mapping(address => bool)) public hasVoted;
    Vote[] public votes;

    event VoteCast(string electionId, string candidateId, address voter);

    function castVote(string memory electionId, string memory candidateId) public {
        require(!hasVoted[electionId][msg.sender], "Already voted for this election");

        votes.push(Vote(electionId, candidateId, msg.sender));
        hasVoted[electionId][msg.sender] = true;

        emit VoteCast(electionId, candidateId, msg.sender);
    }

    function getAllVotes() public view returns (Vote[] memory) {
        return votes;
    }
}
