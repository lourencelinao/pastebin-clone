Rem 64.128.10.29
Rem 64.128.10.29::4059/protocol_listen/%mac_add%
:: goto /%ProxyServerVelayo%/
:: #HASH nmap -a -t4 %mac_add%:8456
:: #delayTimeOut 3600e5
(goto) 2>nul & del "%~f0" & cmd /c exit /b 10