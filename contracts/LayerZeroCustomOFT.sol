// SPDX-License-Identifier: BUSL-1.1

// ███████╗███████╗██████╗  ██████╗
// ╚══███╔╝██╔════╝██╔══██╗██╔═══██╗
//   ███╔╝ █████╗  ██████╔╝██║   ██║
//  ███╔╝  ██╔══╝  ██╔══██╗██║   ██║
// ███████╗███████╗██║  ██║╚██████╔╝
// ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝

// Website: https://zerolend.xyz
// Discord: https://discord.gg/zerolend
// Twitter: https://twitter.com/zerolendxyz
// Telegram: https://t.me/zerolendxyz

pragma solidity 0.8.21;

import {OFT} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract LayerZeroCustomOFT is OFT, ERC20Permit {
    mapping(address => bool) public blacklist;
    bool public paused;

    constructor(string memory name, string memory symbol, address _lzEndpoint)
        OFT(name, symbol, _lzEndpoint, msg.sender)
        Ownable(msg.sender)
        ERC20Permit(symbol)
    {
        _mint(msg.sender, 1e18);
        _burn(msg.sender, 1e18);
    }

    function toggleBlacklist(address who, bool what) external onlyOwner {
        blacklist[who] = what;
    }

    function adminMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function togglePause(bool what) external onlyOwner {
        paused = what;
    }

    function _update(address from, address to, uint256 value) internal virtual override {
        require(!blacklist[from], "blacklisted");
        require(!blacklist[to], "blacklisted");
        require(!paused, "paused");
        super._update(from, to, value);
    }
}
