// Sample HTML response from the FFXIV Lodestone world status page
// Based on the actual structure from https://eu.finalfantasyxiv.com/lodestone/worldstatus/
module.exports = `
<!DOCTYPE html>
<html lang="en-gb" class="en-gb">
<head>
    <title>Server Status | FINAL FANTASY XIV, The Lodestone</title>
</head>
<body id="" class="ldst__body lang_eu">
    <div class="ldst__bg">
        <div class="ldst__contents--worldstatus clearfix">
            <h1 class="heading__title">Server Status</h1>
            
            <!-- Europe Region -->
            <div class="js--tab-content" data-region="3">
                <div class="world-dcgroup__wrapper">
                    <ul class="world-dcgroup">
                        <li class="world-dcgroup__item">
                            <h2 class="world-dcgroup__header">Chaos</h2>
                            <ul>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Cerberus</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Louisoix</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Moogle</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Omega</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li class="world-dcgroup__item">
                            <h2 class="world-dcgroup__header">Light</h2>
                            <ul>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Alpha</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Lich</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Odin</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Phoenix</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Oceania Region -->
            <div class="js--tab-content hide" data-region="4">
                <div class="world-dcgroup__wrapper">
                    <ul class="world-dcgroup">
                        <li class="world-dcgroup__item">
                            <h2 class="world-dcgroup__header">Materia</h2>
                            <ul>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Bismarck</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Ravana</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Sephirot</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- North America Region -->
            <div class="js--tab-content hide" data-region="2">
                <div class="world-dcgroup__wrapper">
                    <ul class="world-dcgroup">
                        <li class="world-dcgroup__item">
                            <h2 class="world-dcgroup__header">Aether</h2>
                            <ul>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Adamantoise</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Cactuar</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li class="world-dcgroup__item">
                            <h2 class="world-dcgroup__header">Crystal</h2>
                            <ul>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Balmung</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Brynhildr</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Japan Region -->
            <div class="js--tab-content hide" data-region="1">
                <div class="world-dcgroup__wrapper">
                    <ul class="world-dcgroup">
                        <li class="world-dcgroup__item">
                            <h2 class="world-dcgroup__header">Elemental</h2>
                            <ul>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Aegis</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Atomos</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li class="world-dcgroup__item">
                            <h2 class="world-dcgroup__header">Gaia</h2>
                            <ul>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Alexander</p>
                                        </div>
                                    </div>
                                </li>
                                <li class="item-list">
                                    <div class="world-list__item">
                                        <div class="world-list__world_name">
                                            <p>Bahamut</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;
